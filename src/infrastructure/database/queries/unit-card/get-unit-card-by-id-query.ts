/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

import type {
  UnitCardVersionDb,
} from '@infrastructure/database/db-types';

import type {
  Sql,
} from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

const getUnitCardByIdQuery = async (
  sql: Sql,
  unitCardId: string,
): Promise<UnitCardVersionDb[]> =>
  await sql`SELECT
      ucv.unit_card_id,
      ucv.unit_card_version_id,
      ucv.unit_card_artwork_url,
      ucv.unit_card_name,
      ucv.unit_card_definition,
      ucv.version_major,
      ucv.version_minor,
      ucv.version_patch
    FROM unit_card_versions ucv
    WHERE ucv.unit_card_id = ${unitCardId}
    ORDER BY
      ucv.version_major DESC,
      ucv.version_minor DESC,
      ucv.version_patch DESC
    LIMIT 1`;

export { getUnitCardByIdQuery };
