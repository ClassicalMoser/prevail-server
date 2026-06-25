import type {
  CommandCardCertificationStatusDb,
  CommandCardListItemDb,
  CommandCardVersionDb,
  WriteCommandCardVersionDb,
} from '../db-types';
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

const getCommandCardsByIdsQuery = async (
  sql: Sql,
  commandCardIds: string[],
): Promise<CommandCardVersionDb[]> =>
  await sql`SELECT DISTINCT ON (ccv.command_card_id)
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
      ccv.version_patch DESC`;

const getLatestCommandCardCertificationsQuery = async (
  sql: Sql,
): Promise<CommandCardCertificationStatusDb[]> =>
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
      ccv.version_patch DESC`;

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
      cc.created_at DESC,
      cc.command_card_id`;

const deleteEmptyCommandCardsQuery = async (sql: Sql): Promise<void> => {
  await sql`DELETE FROM command_cards cc
    WHERE NOT EXISTS (
      SELECT 1
      FROM command_card_versions ccv
      WHERE ccv.command_card_id = cc.command_card_id
    )`;
};

const createEmptyCommandCardQuery = async (
  sql: Sql,
): Promise<{ command_card_id: string }[]> =>
  await sql`INSERT INTO command_cards DEFAULT VALUES
    RETURNING command_card_id`;

const commandCardExistsQuery = async (
  sql: Sql,
  commandCardId: string,
): Promise<{ command_card_id: string }[]> =>
  await sql`SELECT command_card_id
    FROM command_cards
    WHERE command_card_id = ${commandCardId}`;

const createCommandCardVersionQuery = async (
  sql: Sql,
  writeVersion: WriteCommandCardVersionDb,
): Promise<CommandCardVersionDb[]> =>
  await sql`INSERT INTO command_card_versions (
      command_card_id,
      command_card_name,
      version_major,
      version_minor,
      version_patch,
      command_card_definition
    )
    VALUES (
      ${writeVersion.command_card_id},
      ${writeVersion.command_card_name},
      ${writeVersion.version_major},
      ${writeVersion.version_minor},
      ${writeVersion.version_patch},
      ${writeVersion.command_card_definition}
    )
    RETURNING command_card_id,
              command_card_version_id,
              command_card_name,
              command_card_definition,
              version_major,
              version_minor,
              version_patch`;

const getLatestRulesVersionIdQuery = async (
  sql: Sql,
): Promise<{ rules_version_id: string }[]> =>
  await sql`SELECT rules_version_id
    FROM rules_versions
    ORDER BY version_major DESC, version_minor DESC, version_patch DESC
    LIMIT 1`;

const insertCommandCardCertificationsQuery = async (
  sql: Sql,
  commandCardIds: string[],
  rulesVersionId: string,
): Promise<void> => {
  await sql`INSERT INTO command_card_certifications (
      command_card_version_id,
      rules_version_id
    )
    SELECT latest.command_card_version_id, ${rulesVersionId}
    FROM (
      SELECT DISTINCT ON (command_card_id) command_card_version_id
      FROM command_card_versions
      WHERE command_card_id = ANY(${commandCardIds})
      ORDER BY
        command_card_id,
        version_major DESC,
        version_minor DESC,
        version_patch DESC
    ) latest
    ON CONFLICT DO NOTHING`;
};

export {
  commandCardExistsQuery,
  createCommandCardVersionQuery,
  createEmptyCommandCardQuery,
  deleteEmptyCommandCardsQuery,
  getCommandCardByIdQuery,
  getCommandCardsByIdsQuery,
  getCurrentCommandCardsQuery,
  getAllCommandCardsQuery,
  getLatestCommandCardCertificationsQuery,
  getLatestRulesVersionIdQuery,
  insertCommandCardCertificationsQuery,
};
