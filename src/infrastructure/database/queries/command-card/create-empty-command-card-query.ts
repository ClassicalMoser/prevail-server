/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

const createEmptyCommandCardQuery = async (
  sql: Sql,
): Promise<{ command_card_id: string }[]> =>
  await sql`INSERT INTO command_cards DEFAULT VALUES
    RETURNING command_card_id`;

export { createEmptyCommandCardQuery };
