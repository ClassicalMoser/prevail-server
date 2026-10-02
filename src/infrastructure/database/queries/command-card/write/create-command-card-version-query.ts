/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

import type {
  CommandCardVersionDb,
  WriteCommandCardVersionDb,
} from '@infrastructure/database/db-types';

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

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

export { createCommandCardVersionQuery };
