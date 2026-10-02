/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

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

export { insertCommandCardCertificationsQuery };
