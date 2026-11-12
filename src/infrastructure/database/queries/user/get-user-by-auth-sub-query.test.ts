import { recordedSql } from '@testing';
import { getUserByAuthSubQuery } from './get-user-by-auth-sub-query';

describe('getUserByAuthSubQuery function', () => {
  it(
    'reads the user row for this auth subject',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ user_id: 'user-1', user_auth_sub: 'auth0|owner' }];
      // A recorded tag stands in for postgres: the test pins the statement text
      // and bound values, not database behaviour.
      const recorded = recordedSql(produced);
      const rows = await getUserByAuthSubQuery(recorded.sql, 'auth0|owner');
      const call = recorded.calls[0];

      // Players are looked up by the auth subject from their token, not by a
      // client-supplied id.
      expect(call?.text).toContain('WHERE user_auth_sub');
      expect(call?.values).toStrictEqual(['auth0|owner']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
