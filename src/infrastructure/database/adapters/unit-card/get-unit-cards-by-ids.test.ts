import { recordedSql } from '@testing';
import { getUnitCardsByIds } from './get-unit-cards-by-ids';

describe('getUnitCardsByIds function', () => {
  it(
    'answers an empty list for no ids, without a query',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([]);

      await expect(getUnitCardsByIds(recorded.sql, [])).resolves.toStrictEqual({
        data: [],
        success: true,
      });
      expect(recorded.calls).toStrictEqual([]);
    },
  );

  it('asks for exactly the ids it was given', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const recorded = recordedSql([]);
    await getUnitCardsByIds(recorded.sql, ['a', 'b']);

    expect(recorded.calls[0]?.values).toStrictEqual([['a', 'b']]);
  });
});
