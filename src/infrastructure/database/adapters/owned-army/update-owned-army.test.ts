import type { UserStorage } from '@ports';
import { recordedTransactionSql } from '@testing';
import { updateOwnedArmy } from './update-owned-army';

const unused = async (): Promise<never> => {
  throw new Error('not used by updateOwnedArmy');
};

const users: UserStorage = {
  ensureByAuthSub: async () => ({
    data: { authSub: 'auth0|a', userId: 'user-1' },
    success: true,
  }),
  getByAuthSub: unused,
  getByUserId: unused,
};

const write = { armyName: 'Renamed', commandCards: [], units: [] };

describe('updateOwnedArmy function', () => {
  it(
    "succeeds when the owner's live army was replaced",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedTransactionSql([{ army_id: 'army-1' }]);

      await expect(
        updateOwnedArmy(recorded.sql, users, 'auth0|a', 'army-1', write),
      ).resolves.toStrictEqual({ data: undefined, success: true });
    },
  );

  it(
    'answers 404 and writes no join rows when no live army matched',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedTransactionSql([]);

      await expect(
        updateOwnedArmy(recorded.sql, users, 'auth0|a', 'army-1', write),
      ).resolves.toMatchObject({ status: 404, success: false });
      expect(recorded.calls).toHaveLength(1);
    },
  );
});
