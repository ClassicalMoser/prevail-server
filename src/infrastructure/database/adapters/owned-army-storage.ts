import type { ArmyWriteBody } from '@classicalmoser/prevail-contracts';
import type {
  DataErrorSignature,
  LoggerPort,
  OwnedArmyStorage,
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
  armyDisplayName,
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
import type { Sql } from '../sql-type';
import { handleError } from '@utils';

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

const replaceArmyComposition = async (
  sql: Sql,
  armyId: string,
  body: ArmyWriteBody,
): Promise<void> => {
  await deleteArmyUnitCardsQuery(sql, armyId);
  await deleteArmyCommandCardsQuery(sql, armyId);

  for (const row of toArmyUnitCardRows(armyId, body.units)) {
    await insertArmyUnitCardQuery(sql, row);
  }
  for (const row of toArmyCommandCardRows(armyId, body.commandCards)) {
    await insertArmyCommandCardQuery(sql, row);
  }
};

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
        if (rows.length === 0) {
          continue;
        }
        armies.push(await hydrateArmy(sql, rows[0]));
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
  ): Promise<DataErrorSignature<string>> => {
    try {
      const userResult = await userStorage.ensureByAuthSub(ownerAuthSub);
      if (!userResult.success) {
        return userResult;
      }

      const rows: ArmyDb[] = await createArmyQuery(sql, {
        userId: userResult.data.userId,
        armyName: 'Untitled army',
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
    body: ArmyWriteBody,
  ): Promise<DataErrorSignature<void>> => {
    try {
      const userResult = await userStorage.ensureByAuthSub(ownerAuthSub);
      if (!userResult.success) {
        return userResult;
      }

      const updatedRows: ArmyDb[] = await updateArmyQuery(sql, {
        armyId,
        userId: userResult.data.userId,
        armyName: armyDisplayName(body.units),
      });
      if (updatedRows.length === 0) {
        return {
          success: false,
          message: 'Army not found',
          status: 404,
        };
      }

      await replaceArmyComposition(sql, armyId, body);

      return { success: true, data: undefined };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'updating owned army in database',
        message: 'Failed to update owned army in database',
        status: 500,
      });
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
