import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import type {
  CommandCardVersionDb,
  WriteCommandCardVersionDb,
} from '@infrastructure/database/db-types';
import {
  commandCardVersionMapperToDomain,
  writeCommandCardVersionMapper,
} from '@infrastructure/database/mappers';
import {
  createCommandCardVersionQuery,
  commandCardExistsQuery,
} from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';
import { notFound } from '../not-found';

/**
 * Store a new version of an existing command card.
 *
 * The command card must already exist (see `createEmptyCommandCard`). The write mapper
 * validates the command card against its schema before insert, so an invalid command card
 * throws out of the caller's `storageOp` and becomes an error envelope.
 *
 * @param sql - postgres.js client.
 * @param card - The command card definition to store as a new version.
 * @returns The stored command card, or a 404 envelope when its id is unknown.
 */
const createCommandCardVersion = async (
  sql: Sql,
  card: CommandCard,
): Promise<DataErrorSignature<CommandCard>> => {
  const existing = await commandCardExistsQuery(sql, card.id);
  if (existing.length === 0) {
    return notFound('Command card not found');
  }

  const writeVersion: WriteCommandCardVersionDb =
    writeCommandCardVersionMapper(card);
  const rows: CommandCardVersionDb[] = await createCommandCardVersionQuery(
    sql,
    writeVersion,
  );
  const created: DataErrorSignature<CommandCard> = {
    success: true,
    data: commandCardVersionMapperToDomain(rows[0]),
  };
  return created;
};

export { createCommandCardVersion };
