/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

const createEmptyUnitCardQuery = async (
  sql: Sql,
): Promise<{ unit_card_id: string }[]> =>
  await sql`INSERT INTO unit_cards DEFAULT VALUES
    RETURNING unit_card_id`;

export { createEmptyUnitCardQuery };
