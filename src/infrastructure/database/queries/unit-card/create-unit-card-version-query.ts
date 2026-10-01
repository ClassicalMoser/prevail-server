/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

import type {
  UnitCardVersionDb,
  WriteUnitCardVersionDb,
} from '@infrastructure/database/db-types';

import type {
  Sql,
} from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

const createUnitCardVersionQuery = async (
  sql: Sql,
  writeVersion: WriteUnitCardVersionDb,
): Promise<UnitCardVersionDb[]> =>
  await sql`INSERT INTO unit_card_versions (
      unit_card_id,
      unit_card_name,
      unit_card_artwork_url,
      version_major,
      version_minor,
      version_patch,
      unit_card_definition
    )
    VALUES (
      ${writeVersion.unit_card_id},
      ${writeVersion.unit_card_name},
      ${writeVersion.unit_card_artwork_url},
      ${writeVersion.version_major},
      ${writeVersion.version_minor},
      ${writeVersion.version_patch},
      ${writeVersion.unit_card_definition}
    )
    RETURNING unit_card_id,
              unit_card_version_id,
              unit_card_artwork_url,
              unit_card_name,
              unit_card_definition,
              version_major,
              version_minor,
              version_patch`;

export { createUnitCardVersionQuery };
