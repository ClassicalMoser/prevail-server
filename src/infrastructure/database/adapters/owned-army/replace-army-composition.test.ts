import { recordedSql, tempCommandCards, tempUnits } from '@testing';
import { replaceArmyComposition } from './replace-army-composition';

describe('replaceArmyComposition function', () => {
  it(
    'clears both join tables before writing the new lists',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
      await replaceArmyComposition(
        { kind: 'connection', sql: recorded.sql },
        'army-1',
        {
          commandCards: [tempCommandCards[0]],
          units: [{ count: 4, unitType: tempUnits[0] }],
        },
      );

      expect(
        recorded.calls.map((call) => call.text.split(' (')[0]),
      ).toStrictEqual([
        'DELETE FROM army_unit_cards WHERE army_id = ?',
        'DELETE FROM army_command_cards WHERE army_id = ?',
        'INSERT INTO army_unit_cards',
        'INSERT INTO army_command_cards',
      ]);
    },
  );

  it(
    'writes nothing but the clearing for an empty army',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
      await replaceArmyComposition(
        { kind: 'connection', sql: recorded.sql },
        'army-1',
        {
          commandCards: [],
          units: [],
        },
      );

      expect(recorded.calls).toHaveLength(2);
    },
  );
});
