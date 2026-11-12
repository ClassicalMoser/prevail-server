import { recordedSql } from '@testing';
import { commandCardExistsQuery } from './command-card-exists-query';

describe('commandCardExistsQuery function', () => {
  it(
    'looks up the command card id this test named',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ command_card_id: 'card-1' }];
      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql(produced);
      const rows = await commandCardExistsQuery(recorded.sql, 'card-1');
      const call = recorded.calls[0];

      // Existence is checked against the card table itself, not a particular
      // version.
      expect(call?.text).toContain('FROM command_cards');
      // The card id is bound as a parameter.
      expect(call?.values).toStrictEqual(['card-1']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
