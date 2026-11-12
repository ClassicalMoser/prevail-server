import type { Army } from '@classicalmoser/prevail-rules/domain';
import type { ArmyDb } from '@infrastructure/database/db-types';
import {
  buildCommandCards,
  buildUnitCounts,
  toArmy,
} from '@infrastructure/database/mappers';
import {
  getArmyCommandCardsQuery,
  getArmyUnitCardsQuery,
} from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';
import { loadCommandCardsById } from './load-command-cards-by-id';
import { loadUnitTypesById } from './load-unit-types-by-id';

/**
 * Rebuild an owned army from its row plus current catalog definitions.
 *
 * Join tables store ids and quantities. The latest certified unit and command
 * cards are loaded so the returned `Army` matches the rules shape. A join row
 * whose card is missing is dropped by the mappers.
 *
 * @param sql - postgres.js client.
 * @param row - Army identity row, including the display name and owner.
 * @returns The domain army, including the row's display name.
 */
const hydrateArmy = async (sql: Sql, row: ArmyDb): Promise<Army> => {
  // What the player saved: card ids and counts, nothing about the cards.
  const unitRows = await getArmyUnitCardsQuery(sql, row.army_id);
  const commandRows = await getArmyCommandCardsQuery(sql, row.army_id);

  // What the cards are today, from the catalog.
  const unitTypesById = await loadUnitTypesById(
    sql,
    unitRows.map((unitRow) => unitRow.unit_card_id),
  );
  const cardsById = await loadCommandCardsById(
    sql,
    commandRows.map((commandRow) => commandRow.command_card_id),
  );

  // Join the two: each saved id takes the card it names.
  const army = toArmy({
    armyId: row.army_id,
    armyName: row.army_name,
    units: buildUnitCounts(unitRows, unitTypesById),
    commandCards: buildCommandCards(commandRows, cardsById),
  });
  return army;
};

export { hydrateArmy };
