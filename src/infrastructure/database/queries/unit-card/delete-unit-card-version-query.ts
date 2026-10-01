/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Tagged SQL for unit-card rows. Each function returns rows only.
 * Mapping into domain unit types happens in `mappers/`.
 */

const deleteUnitCardVersionQuery = async (params: {
  sql: Sql;
  unitCardId: string;
  versionMajor: number;
  versionMinor: number;
  versionPatch: number;
}): Promise<void> => {
  await params.sql`DELETE FROM unit_card_versions
    WHERE unit_card_id = ${params.unitCardId}
      AND version_major = ${params.versionMajor}
      AND version_minor = ${params.versionMinor}
      AND version_patch = ${params.versionPatch}`;
};

export { deleteUnitCardVersionQuery };
