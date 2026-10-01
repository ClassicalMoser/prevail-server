import {
  tempCommandCards,
  tempUnits,
} from '@classicalmoser/prevail-rules/domain';
import { buildCommandCards } from './build-command-cards';
import { buildUnitCounts } from './build-unit-counts';
import { toArmy } from './to-army';
import { toArmyCommandCardRows } from './to-army-command-card-rows';
import { toArmyUnitCardRows } from './to-army-unit-card-rows';

const armyId = 'army-1';

describe('toArmyUnitCardRows function', () => {
  it(
    'writes the unit type id and the count this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const unitType = tempUnits[0];
      const rows = toArmyUnitCardRows(armyId, [{ unitType, count: 3 }]);

      expect(rows).toStrictEqual([
        {
          army_id: armyId,
          unit_card_id: unitType.id,
          quantity: 3,
        },
      ]);
    },
  );
});

describe('toArmyCommandCardRows function', () => {
  it(
    'writes one row of quantity 1 for the card this test passed',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const card = tempCommandCards[4];
      const rows = toArmyCommandCardRows(armyId, [card]);

      expect(rows).toStrictEqual([
        {
          army_id: armyId,
          command_card_id: card.id,
          quantity: 1,
        },
      ]);
    },
  );
});

describe('buildUnitCounts function', () => {
  it(
    'keeps the quantity for a known unit and drops an unknown id',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const unitType = tempUnits[1];
      const counts = buildUnitCounts(
        [
          { army_id: armyId, unit_card_id: unitType.id, quantity: 2 },
          { army_id: armyId, unit_card_id: 'missing', quantity: 9 },
        ],
        new Map([[unitType.id, unitType]]),
      );

      expect(counts).toStrictEqual([{ unitType, count: 2 }]);
    },
  );
});

describe('buildCommandCards function', () => {
  it(
    'drops a missing card and sorts the rest by the initiatives this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const later = { ...tempCommandCards[4], initiative: 5 };
      const earlier = { ...tempCommandCards[5], initiative: 1 };
      const cards = buildCommandCards(
        [
          { army_id: armyId, command_card_id: later.id, quantity: 1 },
          { army_id: armyId, command_card_id: 'missing', quantity: 1 },
          { army_id: armyId, command_card_id: earlier.id, quantity: 1 },
        ],
        new Map([
          [later.id, later],
          [earlier.id, earlier],
        ]),
      );

      expect(cards.map((card) => card.id)).toStrictEqual([
        earlier.id,
        later.id,
      ]);
    },
  );
});

describe('toArmy function', () => {
  it(
    'keeps the id, units, and command cards this test assembled',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const units = [{ unitType: tempUnits[0], count: 1 }];
      const commandCards = [tempCommandCards[4]];
      const army = toArmy({ armyId, units, commandCards });

      expect(army).toStrictEqual({ id: armyId, units, commandCards });
    },
  );
});
