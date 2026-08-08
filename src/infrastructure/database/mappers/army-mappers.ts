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
): UnitCount[] =>
  rows.flatMap((row) => {
    const unitType = unitTypesById.get(row.unit_card_id);
    if (unitType === undefined) {
      return [];
    }
    return [{ unitType, count: row.quantity }];
  });

const buildCommandCards = (
  rows: ArmyCommandCardDb[],
  cardsById: ReadonlyMap<string, CommandCard>,
): CommandCard[] =>
  rows.flatMap((row) => {
    const card = cardsById.get(row.command_card_id);
    if (card === undefined) {
      return [];
    }
    return [card];
  });

export {
  buildCommandCards,
  buildUnitCounts,
  toArmy,
  toArmyCommandCardRows,
  toArmyUnitCardRows,
};
