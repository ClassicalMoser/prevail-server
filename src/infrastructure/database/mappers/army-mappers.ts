import type { ArmyCommandCardDb, ArmyUnitCardDb } from '../db-types';
import type {
  Army,
  CommandCard,
  UnitCount,
  UnitType,
} from '@classicalmoser/prevail-rules/domain';

const toArmy = (params: {
  armyId: string;
  units: UnitCount[];
  commandCards: CommandCard[];
}): Army => ({
  id: params.armyId,
  units: params.units,
  commandCards: params.commandCards,
});

const toArmyUnitCardRows = (
  armyId: string,
  units: UnitCount[],
): ArmyUnitCardDb[] =>
  units.map((unit) => ({
    army_id: armyId,
    unit_card_id: unit.unitType.id,
    quantity: unit.count,
  }));

const toArmyCommandCardRows = (
  armyId: string,
  commandCards: CommandCard[],
): ArmyCommandCardDb[] =>
  commandCards.map((card) => ({
    army_id: armyId,
    command_card_id: card.id,
    quantity: 1,
  }));

const buildUnitCounts = (
  rows: ArmyUnitCardDb[],
  unitTypesById: ReadonlyMap<string, UnitType>,
): UnitCount[] => {
  const units: UnitCount[] = [];
  for (const row of rows) {
    const unitType = unitTypesById.get(row.unit_card_id);
    if (unitType === undefined) {
      continue;
    }
    units.push({ unitType, count: row.quantity });
  }
  return units;
};

const buildCommandCards = (
  rows: ArmyCommandCardDb[],
  cardsById: ReadonlyMap<string, CommandCard>,
): CommandCard[] => {
  const cards: CommandCard[] = [];
  for (const row of rows) {
    const card = cardsById.get(row.command_card_id);
    if (card === undefined) {
      continue;
    }
    cards.push(card);
  }
  return cards;
};

/** Display name for DB `army_name` — not part of domain Army. */
const armyDisplayName = (units: readonly UnitCount[]): string => {
  const firstUnitName = units[0]?.unitType.name;
  if (firstUnitName !== undefined) {
    return `${firstUnitName} list`;
  }
  return 'Untitled army';
};

export {
  armyDisplayName,
  buildCommandCards,
  buildUnitCounts,
  toArmy,
  toArmyCommandCardRows,
  toArmyUnitCardRows,
};
