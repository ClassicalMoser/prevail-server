/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

// Checks the card id exists before a version is written under it, so an unknown
// id is a 404 rather than a foreign key error.
const unitCardExistsQuery = async (
  sql: Sql,
  unitCardId: string,
): Promise<{ unit_card_id: string }[]> =>
  await sql`SELECT unit_card_id
    FROM unit_cards
    WHERE unit_card_id = ${unitCardId}`;

export { unitCardExistsQuery };
