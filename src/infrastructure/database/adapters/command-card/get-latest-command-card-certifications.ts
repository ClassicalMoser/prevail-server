import type {
  DataErrorSignature,
  CommandCardCertificationStatus,
} from '@ports';
import type { CommandCardCertificationStatusDb } from '@infrastructure/database/db-types';
import { commandCardVersionMapperToDomain } from '@infrastructure/database/mappers';
import { getLatestCommandCardCertificationsQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Load the latest version of every command card with whether it is certified.

 * Statuses are listed in initiative order, the order command cards are played in.
 *
 * An author uses this to see which cards still need certifying after a rules
 * change.
 *
 * @param sql - postgres.js client.
 * @returns Each command card with its certified flag.
 */
const getLatestCommandCardCertifications = async (
  sql: Sql,
): Promise<DataErrorSignature<CommandCardCertificationStatus[]>> => {
  const rows: CommandCardCertificationStatusDb[] =
    await getLatestCommandCardCertificationsQuery(sql);
  const statuses = rows.map((row) => ({
    card: commandCardVersionMapperToDomain(row),
    certified: row.certified,
  }));
  // Listed in initiative order, the order cards are played in.
  const loaded: DataErrorSignature<CommandCardCertificationStatus[]> = {
    success: true,
    data: statuses.toSorted((a, b) => a.card.initiative - b.card.initiative),
  };
  return loaded;
};

export { getLatestCommandCardCertifications };
