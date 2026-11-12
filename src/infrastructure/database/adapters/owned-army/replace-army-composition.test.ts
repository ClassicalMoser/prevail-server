import { recordedSql, tempCommandCards, tempUnits } from '@testing';
import { replaceArmyComposition } from './replace-army-composition';

describe('replaceArmyComposition function', () => {
  it(
    'clears both join tables before writing the new lists',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // One catalog command card and four of one catalog unit are written to an
      // army.
      const recorded = recordedSql();
      await replaceArmyComposition(
        { kind: 'connection', sql: recorded.sql },
        'army-1',
        {
          commandCards: [tempCommandCards[0]],
          units: [{ count: 4, unitType: tempUnits[0] }],
        },
      );

      // Order matters: both old join tables are cleared before any insert, so a
      // shorter new list leaves no stale rows.
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

      // An army with no units or cards still has its old rows cleared, and
      // nothing is inserted.
      expect(recorded.calls).toHaveLength(2);
    },
  );
});
