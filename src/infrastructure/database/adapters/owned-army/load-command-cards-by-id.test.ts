import { recordedSql } from '@testing';
import { loadCommandCardsById } from './load-command-cards-by-id';

describe('loadCommandCardsById function', () => {
  it(
    'asks the catalog for the ids it was given',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The tag returns no rows, so the lookup map stays empty; only the ids
      // sent matter.
      const recorded = recordedSql();
      const found = await loadCommandCardsById(recorded.sql, ['card-1']);

      // The catalog was asked for exactly the card id given, as one array.
      expect(recorded.calls[0]?.values).toStrictEqual([['card-1']]);
      expect(found.size).toBe(0);
    },
  );

  it(
    'skips the catalog for an army with no command cards',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // No rows needed: an army with no command cards has nothing to look up.
      const recorded = recordedSql();
      await loadCommandCardsById(recorded.sql, []);

      // No catalog query ran.
      expect(recorded.calls).toStrictEqual([]);
    },
  );
});
