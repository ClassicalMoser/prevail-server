/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

import type { UnitCardListItemDb } from '@infrastructure/database/db-types';

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

const getAllUnitCardsQuery = async (sql: Sql): Promise<UnitCardListItemDb[]> =>
  await sql`SELECT
      uc.unit_card_id,
      latest.unit_card_name,
      latest.version_major,
      latest.version_minor,
      latest.version_patch
    FROM unit_cards uc
    LEFT JOIN (
      SELECT DISTINCT ON (unit_card_id)
        unit_card_id,
        unit_card_name,
        version_major,
        version_minor,
        version_patch
      FROM unit_card_versions
      ORDER BY
        unit_card_id,
        version_major DESC,
        version_minor DESC,
        version_patch DESC
    ) latest
      ON latest.unit_card_id = uc.unit_card_id
    ORDER BY
      uc.created_at DESC,
      uc.unit_card_id`;

export { getAllUnitCardsQuery };
