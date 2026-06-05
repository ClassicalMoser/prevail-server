import type {
  CommandCardVersionDb,
  WriteCommandCardVersionDb,
} from '../db-types';
import type postgres from 'postgres';

const getCurrentCommandCardVersionsByRulesVersionQuery = async (
  sql: postgres.Sql,
  rulesVersion: string,
): Promise<CommandCardVersionDb[]> =>
  await sql`SELECT DISTINCT ON (cc.command_card_id)
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
    JOIN rules_versions rv
      ON rv.rules_version_id = ccc.rules_version_id
    WHERE rv.version_major = split_part(${rulesVersion}, '.', 1)::int
      AND rv.version_minor = split_part(${rulesVersion}, '.', 2)::int
      AND rv.version_patch = split_part(${rulesVersion}, '.', 3)::int
    ORDER BY
      cc.command_card_id,
      ccv.version_major DESC,
      ccv.version_minor DESC,
      ccv.version_patch DESC`;

const createEmptyCommandCardQuery = async (
  sql: postgres.Sql,
): Promise<{ command_card_id: string }[]> =>
  await sql`INSERT INTO command_cards DEFAULT VALUES
  RETURNING command_card_id`;

const writeCommandCardVersionQuery = async (
  sql: postgres.Sql,
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
      version_patch;`;

export {
  getCurrentCommandCardVersionsByRulesVersionQuery,
  createEmptyCommandCardQuery,
  writeCommandCardVersionQuery,
};
