import type { Army } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import type { ArmyDb, ArmyListItemDb } from '@infrastructure/database/db-types';
import {
  getOwnedArmiesQuery,
  getOwnedArmyRowQuery,
} from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';
import { hydrateArmy } from './hydrate-army';

/**
 * Load every live army a subject owns, each rebuilt from the catalog.
 *
 * @param sql - postgres.js client.
 * @param ownerAuthSub - Auth subject of the owner.
 * @returns The owner's armies, in list order.
 */
const getOwnedArmies = async (
  sql: Sql,
  ownerAuthSub: string,
): Promise<DataErrorSignature<Army[]>> => {
  const listRows: ArmyListItemDb[] = await getOwnedArmiesQuery(
    sql,
    ownerAuthSub,
  );

  // TODO(composition): one list query, then one row query and four hydrate
  // queries per army. A single query for the rows would remove the per-army
  // row lookup; the author decides whether the army list is large enough to
  // matter.
  const armies: Army[] = [];
  for (const listRow of listRows) {
    const rows: ArmyDb[] = await getOwnedArmyRowQuery(
      sql,
      ownerAuthSub,
      listRow.army_id,
    );
    // Re-fetched through the owner-scoped row query so hydration gets the same
    // ownership and archived checks as a single-army read.
    // A row can vanish between the list and the lookup (archived meanwhile).
    if (rows.length > 0) {
      armies.push(await hydrateArmy(sql, rows[0]));
    }
  }
  const loaded: DataErrorSignature<Army[]> = { success: true, data: armies };
  return loaded;
};

export { getOwnedArmies };
