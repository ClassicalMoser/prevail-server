/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for command-card rows. Each function returns rows only.
 * Mapping into domain cards happens in `mappers/`.
 */

// TODO(composition): rules versions are not command-card data, and the unit-card
// adapter calls this too. It belongs in its own queries folder; the author
// decides whether to add one.
const getLatestRulesVersionIdQuery = async (
  sql: Sql,
): Promise<{ rules_version_id: string }[]> =>
  await sql`SELECT rules_version_id
    FROM rules_versions
    ORDER BY version_major DESC, version_minor DESC, version_patch DESC
    LIMIT 1`;

export { getLatestRulesVersionIdQuery };
