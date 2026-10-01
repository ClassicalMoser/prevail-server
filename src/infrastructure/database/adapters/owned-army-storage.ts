import type {
  DataErrorSignature,
  LoggerPort,
  OwnedArmyStorage,
  OwnedArmyWrite,
  UserStorage,
} from '@ports';
import type {
  Army,
  CommandCard,
  UnitType,
} from '@classicalmoser/prevail-rules/domain';
import type {
  ArmyDb,
  ArmyListItemDb,
  CommandCardVersionDb,
  UnitCardVersionDb,
} from '../db-types';
import {
  buildCommandCards,
  buildUnitCounts,
  commandCardVersionMapperToDomain,
  toArmy,
  toArmyCommandCardRows,
  toArmyUnitCardRows,
  unitCardVersionMapperToDomain,
} from '../mappers';
import {
  archiveArmyQuery,
  createArmyQuery,
  deleteArmyCommandCardsQuery,
  deleteArmyUnitCardsQuery,
  getArmyCommandCardsQuery,
  getArmyUnitCardsQuery,
  getCommandCardsByIdsQuery,
  getOwnedArmiesQuery,
  getOwnedArmyRowQuery,
  getUnitCardsByIdsQuery,
  insertArmyCommandCardQuery,
  insertArmyUnitCardQuery,
  updateArmyQuery,
} from '../queries';
import { transactionClient } from '../transaction-client';
import type { Sql, SqlClient } from '../sql-type';
import { handleError } from '@utils';

/**
 * Rebuild an owned army from its row plus current catalog definitions.
 *
 * Join tables store ids and quantities. The latest certified unit and command
 * cards are loaded so the returned `Army` matches the rules shape. A join row
 * whose card is missing is dropped by the mappers.
 *
 * @param sql - postgres.js client.
 * @param row - Army identity row, including the display name and owner.
 * @returns The domain army. The display name stays on the row, not on `Army`.
 */
const hydrateArmy = async (sql: Sql, row: ArmyDb): Promise<Army> => {
  const unitRows = await getArmyUnitCardsQuery(sql, row.army_id);
  const commandRows = await getArmyCommandCardsQuery(sql, row.army_id);

  const unitIds = unitRows.map((unitRow) => unitRow.unit_card_id);
  const commandIds = commandRows.map(
    (commandRow) => commandRow.command_card_id,
  );

  const unitVersions: UnitCardVersionDb[] =
    unitIds.length === 0 ? [] : await getUnitCardsByIdsQuery(sql, unitIds);
  const commandVersions: CommandCardVersionDb[] =
    commandIds.length === 0
      ? []
      : await getCommandCardsByIdsQuery(sql, commandIds);

  const unitTypesById = new Map<string, UnitType>(
    unitVersions.map((version) => [
      version.unit_card_id,
      unitCardVersionMapperToDomain(version),
    ]),
  );
  const cardsById = new Map<string, CommandCard>(
    commandVersions.map((version) => [
      version.command_card_id,
      commandCardVersionMapperToDomain(version),
    ]),
  );

  return toArmy({
    armyId: row.army_id,
    units: buildUnitCounts(unitRows, unitTypesById),
    commandCards: buildCommandCards(commandRows, cardsById),
  });
};

/**
 * Replace an army's unit and command-card join rows.
 *
 * The previous rows are deleted first, then the new composition is inserted.
 * Command-card quantity stays 1 because the domain army stores cards by
 * identity, not by a stack count.
 *
 * @param client - Open transaction, or a root client when the caller has no
 * transaction. The army update passes the transaction so a failed insert
 * rolls these deletes back.
 * @param armyId - Army whose composition is being replaced.
 * @param army - Units and command cards to persist.
 */
const replaceArmyComposition = async (
  client: SqlClient,
  armyId: string,
  army: Pick<OwnedArmyWrite, 'units' | 'commandCards'>,
): Promise<void> => {
  await deleteArmyUnitCardsQuery(client, armyId);
  await deleteArmyCommandCardsQuery(client, armyId);

  for (const row of toArmyUnitCardRows(armyId, army.units)) {
    await insertArmyUnitCardQuery(client, row);
  }
  for (const row of toArmyCommandCardRows(armyId, army.commandCards)) {
    await insertArmyCommandCardQuery(client, row);
  }
};

interface ArmyRename {
  userId: string;
  armyId: string;
  armyName: string;
}

/**
 * Rename a live owned army.
 *
 * An empty result means the army is missing, archived, or owned by someone
 * else. The caller stops before any join-row write.
 *
 * @param client - Connection or open transaction.
 * @param rename - Owner, army, and the display name to store.
 * @returns `true` when a live army row was updated.
 */
const renameOwnedArmy = async (
  client: SqlClient,
  rename: ArmyRename,
): Promise<boolean> => {
  const params = {
    armyId: rename.armyId,
    userId: rename.userId,
    armyName: rename.armyName,
  };
  const updatedRows: ArmyDb[] = await updateArmyQuery(client, params);
  const renamed = updatedRows.length > 0;
  return renamed;
};

interface OwnedArmySave {
  userId: string;
  armyId: string;
  write: OwnedArmyWrite;
}

/**
 * Rename an owned army and replace its composition on one transaction.
 *
 * postgres.js commits when the callback returns and rolls back when it
 * throws. A missing army returns before any join write, so that commit
 * stores nothing. A later insert failure throws, and the rename plus the
 * deletes are undone.
 *
 * @param sql - postgres.js client. `begin` supplies the transaction handle.
 * @param save - Owner, army, and the name plus composition to store.
 * @returns `true` when the army row was updated.
 */
const saveOwnedArmy = async (
  sql: Sql,
  save: OwnedArmySave,
): Promise<boolean> => {
  const saved = await sql.begin(async (tx) => {
    const client = transactionClient(tx);
    const rename: ArmyRename = {
      userId: save.userId,
      armyId: save.armyId,
      armyName: save.write.armyName,
    };
    const renamed = await renameOwnedArmy(client, rename);
    if (!renamed) {
      const missing = false;
      return missing;
    }

    await replaceArmyComposition(client, save.armyId, save.write);
    const wrote = true;
    return wrote;
  });
  return saved;
};

/**
 * Postgres adapter for player-owned armies.
 *
 * Every read and write is scoped by the owner's auth subject. Creating an
 * army ensures a local user row exists for that subject, then inserts the
 * army under that user. Archive sets `archived_at` and does not delete
 * composition history.
 *
 * @param logger - Where unexpected database failures are recorded.
 * @param sql - postgres.js client.
 * @param userStorage - Resolves or creates the owner from an auth subject.
 * @returns The {@link OwnedArmyStorage} port.
 */
const createOwnedArmyStorage = (
  logger: LoggerPort,
  sql: Sql,
  userStorage: UserStorage,
): OwnedArmyStorage => ({
  getOwnedArmies: async (
    ownerAuthSub: string,
  ): Promise<DataErrorSignature<Army[]>> => {
    try {
      const listRows: ArmyListItemDb[] = await getOwnedArmiesQuery(
        sql,
        ownerAuthSub,
      );
      const armies: Army[] = [];
      for (const listRow of listRows) {
        const rows: ArmyDb[] = await getOwnedArmyRowQuery(
          sql,
          ownerAuthSub,
          listRow.army_id,
        );
        if (rows.length > 0) {
          armies.push(await hydrateArmy(sql, rows[0]));
        }
      }
      return { success: true, data: armies };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'getting owned armies from database',
        message: 'Failed to get owned armies from database',
        status: 500,
      });
    }
  },

  getOwnedArmyById: async (
    ownerAuthSub: string,
    armyId: string,
  ): Promise<DataErrorSignature<Army>> => {
    try {
      const rows: ArmyDb[] = await getOwnedArmyRowQuery(
        sql,
        ownerAuthSub,
        armyId,
      );
      if (rows.length === 0) {
        return {
          success: false,
          message: 'Army not found',
          status: 404,
        };
      }

      return {
        success: true,
        data: await hydrateArmy(sql, rows[0]),
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'getting owned army by id from database',
        message: 'Failed to get owned army from database',
        status: 500,
      });
    }
  },

  createOwnedArmy: async (
    ownerAuthSub: string,
    armyName: string,
  ): Promise<DataErrorSignature<string>> => {
    try {
      const userResult = await userStorage.ensureByAuthSub(ownerAuthSub);
      if (!userResult.success) {
        return userResult;
      }

      const rows: ArmyDb[] = await createArmyQuery(sql, {
        userId: userResult.data.userId,
        armyName,
      });

      return {
        success: true,
        data: rows[0].army_id,
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'creating owned army in database',
        message: 'Failed to create owned army in database',
        status: 500,
      });
    }
  },

  updateOwnedArmy: async (
    ownerAuthSub: string,
    armyId: string,
    write: OwnedArmyWrite,
  ): Promise<DataErrorSignature<void>> => {
    try {
      const userResult = await userStorage.ensureByAuthSub(ownerAuthSub);
      if (!userResult.success) {
        return userResult;
      }

      const save: OwnedArmySave = {
        userId: userResult.data.userId,
        armyId,
        write,
      };
      const wrote = await saveOwnedArmy(sql, save);
      if (!wrote) {
        const missing: DataErrorSignature<void> = {
          success: false,
          message: 'Army not found',
          status: 404,
        };
        return missing;
      }

      const updated: DataErrorSignature<void> = {
        success: true,
        data: undefined,
      };
      return updated;
    } catch (error) {
      const failure = handleError({
        error,
        logger,
        context: 'updating owned army in database',
        message: 'Failed to update owned army in database',
        status: 500,
      });
      return failure;
    }
  },

  archiveOwnedArmy: async (
    ownerAuthSub: string,
    armyId: string,
  ): Promise<DataErrorSignature<void>> => {
    try {
      const rows = await archiveArmyQuery(sql, ownerAuthSub, armyId);
      if (rows.length === 0) {
        return {
          success: false,
          message: 'Army not found',
          status: 404,
        };
      }

      return { success: true, data: undefined };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'archiving owned army in database',
        message: 'Failed to archive owned army in database',
        status: 500,
      });
    }
  },
});

export { createOwnedArmyStorage };
