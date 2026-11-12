import { recordedSql, rowsForStatement } from '@testing';
import { getOwnedArmyById } from './get-owned-army-by-id';

// The owned-army row as the query returns it: army-1 belongs to user-1 and is
// not archived.
const row = {
  army_id: 'army-1',
  army_name: 'Legion',
  user_id: 'user-1',
  public: false,
  archived_at: null,
};

describe('getOwnedArmyById function', () => {
  it('answers the army the subject owns', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // Only a statement reading FROM armies gets the row; the composition reads
    // return nothing, so the army is rebuilt empty.
    const recorded = recordedSql(rowsForStatement('FROM armies', [row]));

    await expect(
      getOwnedArmyById(recorded.sql, 'auth0|a', 'army-1'),
    ).resolves.toStrictEqual({
      data: { commandCards: [], id: 'army-1', name: 'Legion', units: [] },
      success: true,
    });
  });

  it(
    'answers 404 when no live army of the subject matched',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The owner-scoped query matches no row: the army is missing, archived,
      // or someone else's.
      const recorded = recordedSql([]);

      await expect(
        getOwnedArmyById(recorded.sql, 'auth0|a', 'army-1'),
      ).resolves.toStrictEqual({
        message: 'Army not found',
        status: 404,
        success: false,
      });
    },
  );
});
