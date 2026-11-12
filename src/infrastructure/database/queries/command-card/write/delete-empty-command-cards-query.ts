/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

// Sweeps ids handed out by an empty-card create that never received a version;
// NOT EXISTS keeps any card that has at least one version.
const deleteEmptyCommandCardsQuery = async (sql: Sql): Promise<void> => {
  await sql`DELETE FROM command_cards cc
    WHERE NOT EXISTS (
      SELECT 1
      FROM command_card_versions ccv
      WHERE ccv.command_card_id = cc.command_card_id
    )`;
};

export { deleteEmptyCommandCardsQuery };
