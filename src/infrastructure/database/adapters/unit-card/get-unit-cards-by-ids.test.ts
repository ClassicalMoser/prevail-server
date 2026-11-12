import { recordedSql } from '@testing';
import { getUnitCardsByIds } from './get-unit-cards-by-ids';

describe('getUnitCardsByIds function', () => {
  it(
    'answers an empty list for no ids, without a query',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // No rows are scripted: an army with no units must not cost a query.
      const recorded = recordedSql([]);

      await expect(getUnitCardsByIds(recorded.sql, [])).resolves.toStrictEqual({
        data: [],
        success: true,
      });
      // No statement ran.
      expect(recorded.calls).toStrictEqual([]);
    },
  );

  it('asks for exactly the ids it was given', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // Two ids stand for the unit cards an army names.
    const recorded = recordedSql([]);
    await getUnitCardsByIds(recorded.sql, ['a', 'b']);

    // The same ids reach the statement, as one array.
    expect(recorded.calls[0]?.values).toStrictEqual([['a', 'b']]);
  });
});
