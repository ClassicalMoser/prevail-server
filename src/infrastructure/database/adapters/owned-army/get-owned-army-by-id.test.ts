import { recordedSql, rowsForStatement } from '@testing';
import { getOwnedArmyById } from './get-owned-army-by-id';

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
