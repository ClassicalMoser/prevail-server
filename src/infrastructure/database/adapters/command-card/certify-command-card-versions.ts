import type { DataErrorSignature } from '@ports';
import { insertCommandCardCertificationsQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';
import { certifyWithLatestRules } from '../certify-with-latest-rules';

/**
 * Certify the latest version of each named command card against the newest rules.
 *
 * Certified command cards are the ones a player may build with, so this is what
 * publishes a command card.
 *
 * @param sql - postgres.js client.
 * @param commandCardIds - command cards whose latest version is certified.
 * @returns An empty success, or a 500 when no rules version exists.
 */
const certifyCommandCardVersions = async (
  sql: Sql,
  commandCardIds: string[],
): Promise<DataErrorSignature<void>> => {
  const certified = await certifyWithLatestRules(
    sql,
    commandCardIds,
    insertCommandCardCertificationsQuery,
  );
  return certified;
};

export { certifyCommandCardVersions };
