import { recordedSql } from '@testing';
import { commandCardExistsQuery } from './command-card-exists-query';

describe('commandCardExistsQuery function', () => {
  it(
    'looks up the command card id this test named',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ command_card_id: 'card-1' }];
      const recorded = recordedSql(produced);
      const rows = await commandCardExistsQuery(recorded.sql, 'card-1');
      const call = recorded.calls[0];

      expect(call?.text).toContain('FROM command_cards');
      expect(call?.values).toStrictEqual(['card-1']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
