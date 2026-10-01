/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

const unitCardExistsQuery = async (
  sql: Sql,
  unitCardId: string,
): Promise<{ unit_card_id: string }[]> =>
  await sql`SELECT unit_card_id
    FROM unit_cards
    WHERE unit_card_id = ${unitCardId}`;

export { unitCardExistsQuery };
