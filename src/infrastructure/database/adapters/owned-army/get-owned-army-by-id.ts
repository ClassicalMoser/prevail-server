import type { Army } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import type { ArmyDb } from '@infrastructure/database/db-types';
import { getOwnedArmyRowQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';
import { notFound } from '../not-found';
import { hydrateArmy } from './hydrate-army';

/**
 * Load one live army, only if the subject owns it.
 *
 * The query is keyed by owner, so another player's army, an archived army and
 * a missing army are all the same 404.
 *
 * @param sql - postgres.js client.
 * @param ownerAuthSub - Auth subject of the owner.
 * @param armyId - Army to load.
 * @returns The army, or a 404 envelope.
 */
const getOwnedArmyById = async (
  sql: Sql,
  ownerAuthSub: string,
  armyId: string,
): Promise<DataErrorSignature<Army>> => {
  const rows: ArmyDb[] = await getOwnedArmyRowQuery(sql, ownerAuthSub, armyId);
  if (rows.length === 0) {
    return notFound('Army not found');
  }
  // The row holds only identity; composition and card definitions are loaded now.
  const army = await hydrateArmy(sql, rows[0]);
  const loaded: DataErrorSignature<Army> = { success: true, data: army };
  return loaded;
};

export { getOwnedArmyById };
