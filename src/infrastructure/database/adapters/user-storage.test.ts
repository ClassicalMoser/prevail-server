import type { LoggerPort } from '@ports';
import { recordedSql } from '@testing';
import type { UserDb } from '../db-types';
import { createUserStorage } from './user-storage';

const logger: LoggerPort = {
  error: (): void => {
    /* database failures; this suite asserts the envelope */
  },
  info: (): void => {
    /* unused */
  },
  warn: (): void => {
    /* unused */
  },
};

const userRow: UserDb = {
  user_auth_sub: 'auth0|owner',
  user_id: 'user-1',
};

describe('createUserStorage function', () => {
  it(
    'returns the mapped user when getByUserId finds a row',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([userRow]);
      const storage = createUserStorage(logger, recorded.sql);

      const result = await storage.getByUserId('user-1');

      expect(result).toStrictEqual({
        data: { authSub: 'auth0|owner', userId: 'user-1' },
        success: true,
      });
      expect(recorded.calls[0]?.values).toStrictEqual(['user-1']);
    },
  );

  it(
    'returns 404 when getByAuthSub finds no row',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([]);
      const storage = createUserStorage(logger, recorded.sql);

      const result = await storage.getByAuthSub('auth0|missing');

      expect(result).toStrictEqual({
        message: 'User not found',
        status: 404,
        success: false,
      });
    },
  );

  it(
    'returns the existing user from ensureByAuthSub without inserting',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([userRow]);
      const storage = createUserStorage(logger, recorded.sql);

      const result = await storage.ensureByAuthSub('auth0|owner');

      expect(result).toStrictEqual({
        data: { authSub: 'auth0|owner', userId: 'user-1' },
        success: true,
      });
      expect(recorded.calls).toHaveLength(1);
    },
  );
});
