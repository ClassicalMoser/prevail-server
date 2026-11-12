import { recordedSql } from '@testing';
import { loadCommandCardsById } from './load-command-cards-by-id';

describe('loadCommandCardsById function', () => {
  it(
    'asks the catalog for the ids it was given',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
      const found = await loadCommandCardsById(recorded.sql, ['card-1']);

      expect(recorded.calls[0]?.values).toStrictEqual([['card-1']]);
      expect(found.size).toBe(0);
    },
  );

  it(
    'skips the catalog for an army with no command cards',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
      await loadCommandCardsById(recorded.sql, []);

      expect(recorded.calls).toStrictEqual([]);
    },
  );
});
