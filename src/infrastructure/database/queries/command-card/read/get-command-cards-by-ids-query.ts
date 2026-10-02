/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

import type { CommandCardVersionDb } from '@infrastructure/database/db-types';

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

const getCommandCardsByIdsQuery = async (
  sql: Sql,
  commandCardIds: string[],
): Promise<CommandCardVersionDb[]> =>
  await sql`WITH latest_cards AS (
    SELECT DISTINCT ON (ccv.command_card_id)
      ccv.command_card_id,
      ccv.command_card_version_id,
      ccv.command_card_name,
      ccv.command_card_definition,
      ccv.version_major,
      ccv.version_minor,
      ccv.version_patch
    FROM command_card_versions ccv
    WHERE ccv.command_card_id = ANY(${commandCardIds})
    ORDER BY
      ccv.command_card_id,
      ccv.version_major DESC,
      ccv.version_minor DESC,
      ccv.version_patch DESC
  )
  SELECT *
  FROM latest_cards
  ORDER BY (command_card_definition->>'initiative')::int ASC`;

export { getCommandCardsByIdsQuery };
