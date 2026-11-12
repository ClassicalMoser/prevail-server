import { recordedSql } from '@testing';
import { getCommandCardsByIds } from './get-command-cards-by-ids';

describe('getCommandCardsByIds function', () => {
  it(
    'answers an empty list for no ids, without a query',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // No rows are scripted: an army with no command cards must not cost a
      // query.
      const recorded = recordedSql([]);

      await expect(
        getCommandCardsByIds(recorded.sql, []),
      ).resolves.toStrictEqual({
        data: [],
        success: true,
      });
      // No statement ran.
      expect(recorded.calls).toStrictEqual([]);
    },
  );

  it('asks for exactly the ids it was given', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // Two ids stand for the cards an army names.
    const recorded = recordedSql([]);
    await getCommandCardsByIds(recorded.sql, ['a', 'b']);

    // The same ids reach the statement, as one array.
    expect(recorded.calls[0]?.values).toStrictEqual([['a', 'b']]);
  });
});
