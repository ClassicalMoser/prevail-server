import type { DataErrorSignature } from '@ports';
import { getLatestRulesVersionIdQuery } from '../queries';
import type { Sql } from '../sql-type';
import { voidSuccess } from './void-success';

/**
 * Certify the latest version of each named card against the newest rules.
 *
 * A certification says a card version was checked against a rules version, so
 * a rules update makes older certifications stale and cards must be certified
 * again. Command cards and unit cards certify the same way and differ only in
 * the table the insert writes, so the caller passes that insert.
 *
 * @param sql - postgres.js client.
 * @param cardIds - Cards whose latest version is being certified.
 * @param insertCertifications - Writes the certification rows for one card kind.
 * @returns An empty success, or a 500 when no rules version exists to certify against.
 */
const certifyWithLatestRules = async (
  sql: Sql,
  cardIds: string[],
  insertCertifications: (
    sql: Sql,
    cardIds: string[],
    rulesVersionId: string,
  ) => Promise<void>,
): Promise<DataErrorSignature<void>> => {
  // Nothing to certify is not an error, and needs no rules lookup.
  if (cardIds.length === 0) {
    return voidSuccess();
  }

  // The newest rules version is what a card is certified against.
  const rulesVersionRows = await getLatestRulesVersionIdQuery(sql);
  if (rulesVersionRows.length === 0) {
    // TODO(wrong): this is a server misconfiguration (no rules version seeded),
    // reported as a 500 with no log line. The author decides whether it should
    // be logged here or in `storageOp`.
    const missing: DataErrorSignature<void> = {
      success: false,
      message: 'No rules version found',
      status: 500,
    };
    return missing;
  }

  await insertCertifications(
    sql,
    cardIds,
    rulesVersionRows[0].rules_version_id,
  );
  return voidSuccess();
};

export { certifyWithLatestRules };
