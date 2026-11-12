import type { DataErrorSignature } from '@ports';
import { insertUnitCardCertificationsQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';
import { certifyWithLatestRules } from '../certify-with-latest-rules';

/**
 * Certify the latest version of each named unit card against the newest rules.
 *
 * Certified unit cards are the ones a player may build with, so this is what
 * publishes a unit card.
 *
 * @param sql - postgres.js client.
 * @param unitCardIds - unit cards whose latest version is certified.
 * @returns An empty success, or a 500 when no rules version exists.
 */
const certifyUnitCardVersions = async (
  sql: Sql,
  unitCardIds: string[],
): Promise<DataErrorSignature<void>> => {
  const certified = await certifyWithLatestRules(
    sql,
    unitCardIds,
    insertUnitCardCertificationsQuery,
  );
  return certified;
};

export { certifyUnitCardVersions };
