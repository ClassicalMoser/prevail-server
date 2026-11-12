/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

// Certify the newest version of each named unit card against one rules version.
// DISTINCT ON picks the highest version per card, because the version an author
// just published is the one to certify. ON CONFLICT DO NOTHING makes
// re-certifying idempotent.
const insertUnitCardCertificationsQuery = async (
  sql: Sql,
  unitCardIds: string[],
  rulesVersionId: string,
): Promise<void> => {
  await sql`INSERT INTO unit_card_certifications (
      unit_card_version_id,
      rules_version_id
    )
    SELECT latest.unit_card_version_id, ${rulesVersionId}
    FROM (
      SELECT DISTINCT ON (unit_card_id) unit_card_version_id
      FROM unit_card_versions
      WHERE unit_card_id = ANY(${unitCardIds})
      ORDER BY
        unit_card_id,
        version_major DESC,
        version_minor DESC,
        version_patch DESC
    ) latest
    ON CONFLICT DO NOTHING`;
};

export { insertUnitCardCertificationsQuery };
