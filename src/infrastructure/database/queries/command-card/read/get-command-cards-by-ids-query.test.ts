import { recordedSql } from '@testing';
import { getCommandCardsByIdsQuery } from './get-command-cards-by-ids-query';

describe('getCommandCardsByIdsQuery function', () => {
  it(
    'keeps the latest version of each requested command card',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ command_card_id: 'card-1' }];
      const recorded = recordedSql(produced);
      const rows = await getCommandCardsByIdsQuery(recorded.sql, [
        'card-1',
        'card-2',
      ]);
      const call = recorded.calls[0];

      expect(call?.text).toContain('DISTINCT ON (ccv.command_card_id)');
      expect(call?.values).toStrictEqual([['card-1', 'card-2']]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
