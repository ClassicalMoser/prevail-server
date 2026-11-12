import { recordingLogger } from '@testing';
import type { UserStorage } from '@ports';
import type { Sql } from '@infrastructure/database/sql-type';
import { createOwnedArmyStorage } from './create-owned-army-storage';

const unused = async (): Promise<never> => {
  throw new Error('not used here');
};

const users: UserStorage = {
  ensureByAuthSub: unused,
  getByAuthSub: unused,
  getByUserId: unused,
};

/** A statement that throws, as a dropped connection would. */
const lostConnection = async (): Promise<never> => {
  throw new Error('connection lost');
};

/** A client whose every statement throws. */
const brokenSql = (): Sql => {
  const sql = lostConnection as unknown as Sql; // template-tag double; Sql also owns the pool
  return sql;
};

describe('createOwnedArmyStorage function', () => {
  it(
    'turns a thrown driver error into a 500 and logs it',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const logger = recordingLogger();
      const storage = createOwnedArmyStorage(logger, brokenSql(), users);

      await expect(
        storage.getOwnedArmyById('auth0|a', 'army-1'),
      ).resolves.toStrictEqual({
        message: 'Failed to get owned army from database',
        status: 500,
        success: false,
      });
      expect(logger.errors).toHaveLength(1);
    },
  );

  it(
    "words each operation's failure for that operation",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const storage = createOwnedArmyStorage(
        recordingLogger(),
        brokenSql(),
        users,
      );

      await expect(
        storage.archiveOwnedArmy('auth0|a', 'army-1'),
      ).resolves.toMatchObject({
        message: 'Failed to archive owned army in database',
      });
      await expect(storage.getOwnedArmies('auth0|a')).resolves.toMatchObject({
        message: 'Failed to get owned armies from database',
      });
    },
  );
});
