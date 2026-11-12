import { recordedSql } from '@testing';
import { createUserByAuthSubQuery } from './create-user-by-auth-sub-query';

describe('createUserByAuthSubQuery function', () => {
  it(
    'inserts a user for this auth subject and returns the new row',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The row the database would return for the new user; the tag hands it
      // back unchanged.
      const produced = [{ user_id: 'user-1', user_auth_sub: 'auth0|owner' }];
      const recorded = recordedSql(produced);
      const rows = await createUserByAuthSubQuery(recorded.sql, 'auth0|owner');
      const call = recorded.calls[0];

      // The first sign-in creates the player record: pin an INSERT into users.
      expect(call?.text).toContain('INSERT INTO users');
      // The auth subject is bound as a parameter, never spliced into the text,
      // so a token subject cannot inject SQL.
      expect(call?.values).toStrictEqual(['auth0|owner']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
