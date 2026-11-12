import { recordedSql, rowsForStatement } from '@testing';
import { getOwnedArmies } from './get-owned-armies';

const listRows = [{ army_id: 'army-1', army_name: 'Legion' }];
const armyRow = {
  army_id: 'army-1',
  army_name: 'Legion',
  user_id: 'user-1',
  public: false,
  archived_at: null,
};

/** The list query says ORDER BY; the per-army row lookup selects a.public. */
const listThenRow = (text: string): readonly Record<string, unknown>[] => [
  ...rowsForStatement('ORDER BY', listRows)(text),
  ...rowsForStatement('a.public', [armyRow])(text),
];

describe('getOwnedArmies function', () => {
  it(
    'answers an empty list for a subject with no armies',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        getOwnedArmies(recordedSql([]).sql, 'auth0|a'),
      ).resolves.toStrictEqual({ data: [], success: true });
    },
  );

  it('rebuilds each army the list names', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    await expect(
      getOwnedArmies(recordedSql(listThenRow).sql, 'auth0|a'),
    ).resolves.toStrictEqual({
      data: [{ commandCards: [], id: 'army-1', name: 'Legion', units: [] }],
      success: true,
    });
  });

  it(
    'skips an army archived between the list and the lookup',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The list names the army, then the owner-scoped row lookup finds nothing.
      const recorded = recordedSql(rowsForStatement('ORDER BY', listRows));

      await expect(
        getOwnedArmies(recorded.sql, 'auth0|a'),
      ).resolves.toStrictEqual({ data: [], success: true });
    },
  );
});
