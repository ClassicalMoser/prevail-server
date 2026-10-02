import { recordedSql } from '@testing';
import { getUserByAuthSubQuery } from './get-user-by-auth-sub-query';

describe('getUserByAuthSubQuery function', () => {
  it(
    'reads the user row for this auth subject',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ user_id: 'user-1', user_auth_sub: 'auth0|owner' }];
      const recorded = recordedSql(produced);
      const rows = await getUserByAuthSubQuery(recorded.sql, 'auth0|owner');
      const call = recorded.calls[0];

      expect(call?.text).toContain('WHERE user_auth_sub');
      expect(call?.values).toStrictEqual(['auth0|owner']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
