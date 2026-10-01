/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

import type {
  Sql,
} from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

const deleteEmptyUnitCardsQuery = async (sql: Sql): Promise<void> => {
  await sql`DELETE FROM unit_cards uc
    WHERE NOT EXISTS (
      SELECT 1
      FROM unit_card_versions ucv
      WHERE ucv.unit_card_id = uc.unit_card_id
    )`;
};

export { deleteEmptyUnitCardsQuery };
