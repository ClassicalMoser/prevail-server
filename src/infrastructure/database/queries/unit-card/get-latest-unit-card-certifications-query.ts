/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

import type {
  UnitCardCertificationStatusDb,
} from '@infrastructure/database/db-types';

import type {
  Sql,
} from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

const getLatestUnitCardCertificationsQuery = async (
  sql: Sql,
): Promise<UnitCardCertificationStatusDb[]> =>
  await sql`WITH latest_rules AS (
    SELECT rules_version_id
    FROM rules_versions
    ORDER BY version_major DESC, version_minor DESC, version_patch DESC
    LIMIT 1
  )
  SELECT DISTINCT ON (uc.unit_card_id)
      uc.unit_card_id,
      ucv.unit_card_version_id,
      ucv.unit_card_artwork_url,
      ucv.unit_card_name,
      ucv.unit_card_definition,
      ucv.version_major,
      ucv.version_minor,
      ucv.version_patch,
      (ucc.unit_card_version_id IS NOT NULL) AS certified
    FROM unit_cards uc
    JOIN unit_card_versions ucv
      ON ucv.unit_card_id = uc.unit_card_id
    LEFT JOIN latest_rules lr ON TRUE
    LEFT JOIN unit_card_certifications ucc
      ON ucc.unit_card_version_id = ucv.unit_card_version_id
      AND ucc.rules_version_id = lr.rules_version_id
    ORDER BY
      uc.unit_card_id,
      ucv.version_major DESC,
      ucv.version_minor DESC,
      ucv.version_patch DESC`;

export { getLatestUnitCardCertificationsQuery };
