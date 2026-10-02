import { recordedSql } from '@testing';
import { createUserByAuthSubQuery } from './create-user-by-auth-sub-query';

describe('createUserByAuthSubQuery function', () => {
  it(
    'inserts a user for this auth subject and returns the new row',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ user_id: 'user-1', user_auth_sub: 'auth0|owner' }];
      const recorded = recordedSql(produced);
      const rows = await createUserByAuthSubQuery(recorded.sql, 'auth0|owner');
      const call = recorded.calls[0];

      expect(call?.text).toContain('INSERT INTO users');
      expect(call?.values).toStrictEqual(['auth0|owner']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
