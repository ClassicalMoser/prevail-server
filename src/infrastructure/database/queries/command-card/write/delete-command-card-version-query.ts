/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

const deleteCommandCardVersionQuery = async (params: {
  sql: Sql;
  commandCardId: string;
  versionMajor: number;
  versionMinor: number;
  versionPatch: number;
}): Promise<void> => {
  await params.sql`DELETE FROM command_card_versions
    WHERE command_card_id = ${params.commandCardId}
      AND version_major = ${params.versionMajor}
      AND version_minor = ${params.versionMinor}
      AND version_patch = ${params.versionPatch}`;
};

export { deleteCommandCardVersionQuery };
