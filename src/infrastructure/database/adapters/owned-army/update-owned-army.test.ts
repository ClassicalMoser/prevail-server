import type { UserStorage } from '@ports';
import { recordedTransactionSql } from '@testing';
import { updateOwnedArmy } from './update-owned-army';

// A user storage method that must not be called by this use.
const unused = async (): Promise<never> => {
  throw new Error('not used by updateOwnedArmy');
};

const users: UserStorage = {
  // The user lookup resolves the auth subject to user-1, the owner the rename
  // is scoped to.
  ensureByAuthSub: async () => ({
    data: { authSub: 'auth0|a', userId: 'user-1' },
    success: true,
  }),
  getByAuthSub: unused,
  getByUserId: unused,
};

// A replacement army with a new name and an empty composition.
const write = { armyName: 'Renamed', commandCards: [], units: [] };

describe('updateOwnedArmy function', () => {
  it(
    "succeeds when the owner's live army was replaced",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A transaction recorder stands in for postgres; its first statement (the
      // rename) returns a row, so a live army matched.
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

      // The rename matches no live army.
      const recorded = recordedTransactionSql([]);

      await expect(
        updateOwnedArmy(recorded.sql, users, 'auth0|a', 'army-1', write),
      ).resolves.toMatchObject({ status: 404, success: false });
      // Only the rename ran: a missing army must not have its join rows cleared
      // or rewritten.
      expect(recorded.calls).toHaveLength(1);
    },
  );
});
