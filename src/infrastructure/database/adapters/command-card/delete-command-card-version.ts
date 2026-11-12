import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { parseVersionTriple } from '@infrastructure/database/mappers';
import { deleteCommandCardVersionQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';
import { voidSuccess } from '../void-success';

/**
 * Delete one stored version of a command card.
 *
 * The version is named by the card's own `version` text, which is split into
 * major, minor and patch to match the stored columns.
 *
 * @param sql - postgres.js client.
 * @param card - The command card whose id and version name the row.
 * @returns An empty success, whether or not a row matched.
 */
const deleteCommandCardVersion = async (
  sql: Sql,
  card: CommandCard,
): Promise<DataErrorSignature<void>> => {
  const { major, minor, patch } = parseVersionTriple(card.version);
  await deleteCommandCardVersionQuery({
    sql,
    commandCardId: card.id,
    versionMajor: major,
    versionMinor: minor,
    versionPatch: patch,
  });
  return voidSuccess();
};

export { deleteCommandCardVersion };
