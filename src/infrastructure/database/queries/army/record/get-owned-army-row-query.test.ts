import { recordedSql } from '@testing';
import { getOwnedArmyRowQuery } from './get-owned-army-row-query';

describe('getOwnedArmyRowQuery function', () => {
  it(
    'reads one unarchived army when the auth subject owns it',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [
        {
          army_id: 'army-1',
          army_name: 'Legion',
          user_id: 'user-1',
          public: true,
          archived_at: null,
        },
      ];
      // A recorded tag stands in for postgres; the test pins the statement
      // shape.
      const recorded = recordedSql(produced);
      const rows = await getOwnedArmyRowQuery(
        recorded.sql,
        'auth0|owner',
        'army-1',
      );
      const call = recorded.calls[0];

      // The query is keyed by the auth subject through the users join, so
      // another player's army id finds nothing.
      expect(call?.text).toContain('u.user_auth_sub');
      // Army id first, then the owner's auth subject, as bound parameters.
      expect(call?.values).toStrictEqual(['army-1', 'auth0|owner']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
