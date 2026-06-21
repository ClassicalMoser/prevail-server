import type { CommandCardVersionDb } from '../db-types';
import type { Sql } from '../sql-type';

const getCurrentCommandCardsQuery = async (
  sql: Sql,
): Promise<CommandCardVersionDb[]> =>
  await sql`WITH latest_rules AS (
    SELECT rules_version_id
    FROM rules_versions
    ORDER BY version_major DESC, version_minor DESC, version_patch DESC
    LIMIT 1
  )
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
      ccv.version_patch DESC`;

const getCommandCardByIdQuery = async (
  sql: Sql,
  commandCardId: string,
): Promise<CommandCardVersionDb[]> =>
  await sql`SELECT
      ccv.command_card_id,
      ccv.command_card_version_id,
      ccv.command_card_name,
      ccv.command_card_definition,
      ccv.version_major,
      ccv.version_minor,
      ccv.version_patch
    FROM command_card_versions ccv
    WHERE ccv.command_card_id = ${commandCardId}
    ORDER BY
      ccv.version_major DESC,
      ccv.version_minor DESC,
      ccv.version_patch DESC
    LIMIT 1`;

export { getCommandCardByIdQuery, getCurrentCommandCardsQuery };
