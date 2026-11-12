import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { CommandCardVersionDb } from '@infrastructure/database/db-types';
import { commandCardVersionMapperToDomain } from '@infrastructure/database/mappers';
import { getCommandCardsByIdsQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';

/**
 * Load the current definition of each command card an army lists, by card id.
 *
 * An army row stores only card ids. The card's command and effects come from
 * the catalog, so a player's army always plays with the cards as published
 * now. An army with no command cards skips the query, because an empty id
 * list is not a valid `IN (...)`.
 *
 * @param sql - postgres.js client.
 * @param commandCardIds - Ids from the army's command-card join rows.
 * @returns Each found command card, keyed by its card id.
 */
const loadCommandCardsById = async (
  sql: Sql,
  commandCardIds: readonly string[],
): Promise<Map<string, CommandCard>> => {
  const versions: CommandCardVersionDb[] =
    commandCardIds.length === 0
      ? []
      : await getCommandCardsByIdsQuery(sql, [...commandCardIds]);
  const entries = versions.map((version): [string, CommandCard] => [
    version.command_card_id,
    commandCardVersionMapperToDomain(version),
  ]);
  const cardsById = new Map<string, CommandCard>(entries);
  return cardsById;
};

export { loadCommandCardsById };
