import type { DataErrorSignature, UnitCardCertificationStatus } from '@ports';
import type { UnitCardCertificationStatusDb } from '@infrastructure/database/db-types';
import { unitCardVersionMapperToDomain } from '@infrastructure/database/mappers';
import { getLatestUnitCardCertificationsQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Load the latest version of every unit card with whether it is certified.

 * Statuses are in the order the query returns them.
 *
 * An author uses this to see which cards still need certifying after a rules
 * change.
 *
 * @param sql - postgres.js client.
 * @returns Each unit card with its certified flag.
 */
const getLatestUnitCardCertifications = async (
  sql: Sql,
): Promise<DataErrorSignature<UnitCardCertificationStatus[]>> => {
  const rows: UnitCardCertificationStatusDb[] =
    await getLatestUnitCardCertificationsQuery(sql);
  // The flag comes from the row; the card itself is the newest version, certified or not.
  const statuses = rows.map((row) => ({
    card: unitCardVersionMapperToDomain(row),
    certified: row.certified,
  }));
  const loaded: DataErrorSignature<UnitCardCertificationStatus[]> = {
    success: true,
    data: statuses,
  };
  return loaded;
};

export { getLatestUnitCardCertifications };
