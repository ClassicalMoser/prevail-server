import type { UserStorage } from '@ports';
import { recordedSql } from '@testing';
import { createOwnedArmy } from './create-owned-army';

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

      const recorded = recordedSql([{ army_id: 'army-1' }]);
      const storage = users(async () => ({
        data: { authSub: 'auth0|a', userId: 'user-1' },
        success: true,
      }));

      await expect(
        createOwnedArmy(recorded.sql, storage, 'auth0|a', 'Legion'),
      ).resolves.toStrictEqual({ data: 'army-1', success: true });
      expect(recorded.calls[0]?.values).toStrictEqual(['user-1', 'Legion']);
    },
  );

  it(
    'answers the user lookup failure and inserts nothing',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
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
      expect(recorded.calls).toStrictEqual([]);
    },
  );
});
