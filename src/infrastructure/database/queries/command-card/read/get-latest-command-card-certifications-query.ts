/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

import type { CommandCardCertificationStatusDb } from '@infrastructure/database/db-types';

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

const getLatestCommandCardCertificationsQuery = async (
  sql: Sql,
): Promise<CommandCardCertificationStatusDb[]> =>
  await sql`WITH latest_rules AS (
    SELECT rules_version_id
    FROM rules_versions
    ORDER BY version_major DESC, version_minor DESC, version_patch DESC
    LIMIT 1
  ),
  latest_cards AS (
    SELECT DISTINCT ON (cc.command_card_id)
      cc.command_card_id,
      ccv.command_card_version_id,
      ccv.command_card_name,
      ccv.command_card_definition,
      ccv.version_major,
      ccv.version_minor,
      ccv.version_patch,
      (ccc.command_card_version_id IS NOT NULL) AS certified
    FROM command_cards cc
    JOIN command_card_versions ccv
      ON ccv.command_card_id = cc.command_card_id
    LEFT JOIN latest_rules lr ON TRUE
    LEFT JOIN command_card_certifications ccc
      ON ccc.command_card_version_id = ccv.command_card_version_id
      AND ccc.rules_version_id = lr.rules_version_id
    ORDER BY
      cc.command_card_id,
      ccv.version_major DESC,
      ccv.version_minor DESC,
      ccv.version_patch DESC
  )
  SELECT *
  FROM latest_cards
  ORDER BY (command_card_definition->>'initiative')::int ASC`;

export { getLatestCommandCardCertificationsQuery };
