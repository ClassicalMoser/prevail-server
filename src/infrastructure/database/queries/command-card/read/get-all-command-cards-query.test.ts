import { recordedSql } from '@testing';
import { getAllCommandCardsQuery } from './get-all-command-cards-query';

describe('getAllCommandCardsQuery function', () => {
  it(
    'lists every command card with its latest version fields',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ command_card_id: 'card-1' }];
      const recorded = recordedSql(produced);
      const rows = await getAllCommandCardsQuery(recorded.sql);
      const call = recorded.calls[0];

      expect(call?.text).toContain('FROM command_cards');
      expect(call?.values).toStrictEqual([]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
