import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import type { CommandCardVersionDb } from '@infrastructure/database/db-types';
import { commandCardVersionMapperToDomain } from '@infrastructure/database/mappers';
import { getCommandCardByIdQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';
import { notFound } from '../not-found';

/**
 * Load the latest version of one command card.
 *
 * @param sql - postgres.js client.
 * @param id - The command card's id.
 * @returns The command card, or a 404 envelope when no version exists.
 */
const getCommandCardById = async (
  sql: Sql,
  id: string,
): Promise<DataErrorSignature<CommandCard>> => {
  const rows: CommandCardVersionDb[] = await getCommandCardByIdQuery(sql, id);
  if (rows.length === 0) {
    return notFound('Command card not found');
  }
  const loaded: DataErrorSignature<CommandCard> = {
    success: true,
    data: commandCardVersionMapperToDomain(rows[0]),
  };
  return loaded;
};

export { getCommandCardById };
