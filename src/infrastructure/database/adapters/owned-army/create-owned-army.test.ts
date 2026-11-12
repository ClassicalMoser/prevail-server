import type { UserStorage } from '@ports';
import { recordedSql } from '@testing';
import { createOwnedArmy } from './create-owned-army';

// A user storage method that must not be called by this use.
const unused = async (): Promise<never> => {
  throw new Error('not used by createOwnedArmy');
};

const users = (ensure: UserStorage['ensureByAuthSub']): UserStorage => ({
  ensureByAuthSub: ensure,
  getByAuthSub: unused,
  getByUserId: unused,
});

describe('createOwnedArmy function', () => {
  it(
    'inserts the army under the resolved user and answers its id',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The insert returns the new army's id.
      const recorded = recordedSql([{ army_id: 'army-1' }]);
      // The user lookup resolves the auth subject to user-1, the owner the army
      // is stored under.
      const storage = users(async () => ({
        data: { authSub: 'auth0|a', userId: 'user-1' },
        success: true,
      }));

      await expect(
        createOwnedArmy(recorded.sql, storage, 'auth0|a', 'Legion'),
      ).resolves.toStrictEqual({ data: 'army-1', success: true });
      // The army is inserted under the resolved user id with the name this test
      // chose.
      expect(recorded.calls[0]?.values).toStrictEqual(['user-1', 'Legion']);
    },
  );

  it(
    'answers the user lookup failure and inserts nothing',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // No rows are scripted: nothing should be inserted.
      const recorded = recordedSql();
      // The user lookup fails, so there is no owner to store the army under.
      const storage = users(async () => ({
        message: 'no user',
        status: 500,
        success: false,
      }));

      await expect(
        createOwnedArmy(recorded.sql, storage, 'auth0|a', 'Legion'),
      ).resolves.toStrictEqual({
        message: 'no user',
        status: 500,
        success: false,
      });
      // The lookup's failure is returned as is and no insert ran.
      expect(recorded.calls).toStrictEqual([]);
    },
  );
});
