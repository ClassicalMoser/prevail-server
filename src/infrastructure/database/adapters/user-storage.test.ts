import { recordedSql, recordingLogger } from '@testing';
import type { UserDb } from '../db-types';
import { createUserStorage } from './user-storage';

const logger = recordingLogger();

// The row as postgres returns it, in snake_case columns; the adapter maps it to
// the domain user.
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

      // The recorded tag answers the lookup with this one user row.
      const recorded = recordedSql([userRow]);
      const storage = createUserStorage(logger, recorded.sql);

      const result = await storage.getByUserId('user-1');

      // The mapped user uses camelCase fields; the row's column names do not
      // leak out.
      expect(result).toStrictEqual({
        data: { authSub: 'auth0|owner', userId: 'user-1' },
        success: true,
      });
      // The lookup was keyed by the user id this test asked for.
      expect(recorded.calls[0]?.values).toStrictEqual(['user-1']);
    },
  );

  it(
    'returns 404 when getByAuthSub finds no row',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The tag answers with no rows: this auth subject has never signed in.
      const recorded = recordedSql([]);
      const storage = createUserStorage(logger, recorded.sql);

      const result = await storage.getByAuthSub('auth0|missing');

      // An unknown subject is a 404 'User not found' rather than an empty
      // success.
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

      // The user already exists, so ensureByAuthSub finds the row on its first
      // read.
      const recorded = recordedSql([userRow]);
      const storage = createUserStorage(logger, recorded.sql);

      const result = await storage.ensureByAuthSub('auth0|owner');

      expect(result).toStrictEqual({
        data: { authSub: 'auth0|owner', userId: 'user-1' },
        success: true,
      });
      // Only the read ran: an existing player is never inserted twice.
      expect(recorded.calls).toHaveLength(1);
    },
  );
});
