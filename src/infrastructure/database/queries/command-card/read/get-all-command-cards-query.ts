/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

import type { CommandCardListItemDb } from '@infrastructure/database/db-types';

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

const getAllCommandCardsQuery = async (
  sql: Sql,
): Promise<CommandCardListItemDb[]> =>
  await sql`SELECT
      cc.command_card_id,
      latest.command_card_name,
      latest.version_major,
      latest.version_minor,
      latest.version_patch
    FROM command_cards cc
    LEFT JOIN (
      SELECT DISTINCT ON (command_card_id)
        command_card_id,
        command_card_name,
        command_card_definition,
        version_major,
        version_minor,
        version_patch
      FROM command_card_versions
      ORDER BY
        command_card_id,
        version_major DESC,
        version_minor DESC,
        version_patch DESC
    ) latest
      ON latest.command_card_id = cc.command_card_id
    ORDER BY
      (latest.command_card_definition->>'initiative')::int ASC NULLS LAST,
      cc.command_card_id`;

export { getAllCommandCardsQuery };
