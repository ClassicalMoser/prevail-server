import type { OwnedArmyWrite } from '@ports';
import {
  toArmyCommandCardRows,
  toArmyUnitCardRows,
} from '@infrastructure/database/mappers';
import {
  deleteArmyCommandCardsQuery,
  deleteArmyUnitCardsQuery,
  insertArmyCommandCardQuery,
  insertArmyUnitCardQuery,
} from '@infrastructure/database/queries';
import type { SqlClient } from '@infrastructure/database/sql-type';

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
  // Clear first: the new list is the whole army, not a patch on the old one.
  await deleteArmyUnitCardsQuery(client, armyId);
  await deleteArmyCommandCardsQuery(client, armyId);

  for (const row of toArmyUnitCardRows(armyId, army.units)) {
    await insertArmyUnitCardQuery(client, row);
  }
  for (const row of toArmyCommandCardRows(armyId, army.commandCards)) {
    await insertArmyCommandCardQuery(client, row);
  }
};

export { replaceArmyComposition };
