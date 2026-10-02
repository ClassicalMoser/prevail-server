import { recordedSql } from '@testing';
import { getCommandCardByIdQuery } from './get-command-card-by-id-query';

describe('getCommandCardByIdQuery function', () => {
  it(
    'reads the latest version of the command card this test named',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ command_card_id: 'card-1' }];
      const recorded = recordedSql(produced);
      const rows = await getCommandCardByIdQuery(recorded.sql, 'card-1');
      const call = recorded.calls[0];

      expect(call?.text).toContain('command_card_id');
      expect(call?.values).toStrictEqual(['card-1']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
