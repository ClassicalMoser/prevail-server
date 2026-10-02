/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

const deleteEmptyCommandCardsQuery = async (sql: Sql): Promise<void> => {
  await sql`DELETE FROM command_cards cc
    WHERE NOT EXISTS (
      SELECT 1
      FROM command_card_versions ccv
      WHERE ccv.command_card_id = cc.command_card_id
    )`;
};

export { deleteEmptyCommandCardsQuery };
