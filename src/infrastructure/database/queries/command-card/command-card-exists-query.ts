/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

import type {
  Sql,
} from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

const commandCardExistsQuery = async (
  sql: Sql,
  commandCardId: string,
): Promise<{ command_card_id: string }[]> =>
  await sql`SELECT command_card_id
    FROM command_cards
    WHERE command_card_id = ${commandCardId}`;

export { commandCardExistsQuery };
