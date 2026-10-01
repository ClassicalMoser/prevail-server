/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

import type {
  CommandCardVersionDb,
} from '@infrastructure/database/db-types';

import type {
  Sql,
} from '@infrastructure/database/sql-type';

/**
 * Current certified command cards, one row per card, initiative ascending.
 *
 * `latest_rules` is the highest rules version. A card counts as current only
 * when a certification row joins that version. `DISTINCT ON` keeps the
 * highest card version among those certifications. The outer order reads
 * initiative out of the JSON definition so the list matches round order.
 */
const getCurrentCommandCardsQuery = async (
  sql: Sql,
): Promise<CommandCardVersionDb[]> =>
  await sql`WITH latest_rules AS (
    -- Highest rules version. Certification against an older rules row is stale.
    SELECT rules_version_id
    FROM rules_versions
    ORDER BY version_major DESC, version_minor DESC, version_patch DESC
    LIMIT 1
  ),
  latest_cards AS (
    -- One row per card: the highest version certified against that rules version.
    SELECT DISTINCT ON (cc.command_card_id)
      cc.command_card_id,
      ccv.command_card_version_id,
      ccv.command_card_name,
      ccv.command_card_definition,
      ccv.version_major,
      ccv.version_minor,
      ccv.version_patch
    FROM command_cards cc
    JOIN command_card_versions ccv
      ON ccv.command_card_id = cc.command_card_id
    JOIN command_card_certifications ccc
      ON ccc.command_card_version_id = ccv.command_card_version_id
    JOIN latest_rules lr
      ON lr.rules_version_id = ccc.rules_version_id
    ORDER BY
      cc.command_card_id,
      ccv.version_major DESC,
      ccv.version_minor DESC,
      ccv.version_patch DESC
  )
  SELECT *
  FROM latest_cards
  ORDER BY (command_card_definition->>'initiative')::int ASC`;

export { getCurrentCommandCardsQuery };
