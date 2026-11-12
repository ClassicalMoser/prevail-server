import { recordedSql } from '@testing';
import { getOwnedArmiesQuery } from './get-owned-armies-query';

describe('getOwnedArmiesQuery function', () => {
  it(
    'lists unarchived armies for this auth subject, newest first',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ army_id: 'army-1', army_name: 'Legion' }];
      // A recorded tag stands in for postgres; the test pins the statement
      // shape.
      const recorded = recordedSql(produced);
      const rows = await getOwnedArmiesQuery(recorded.sql, 'auth0|owner');
      const call = recorded.calls[0];

      // A player's army list shows the newest army first.
      expect(call?.text).toContain('ORDER BY a.created_at DESC');
      // Only the auth subject is bound, so the list is always the caller's own
      // armies.
      expect(call?.values).toStrictEqual(['auth0|owner']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
