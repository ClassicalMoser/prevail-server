import { recordedSql } from '@testing';
import { getOwnedArmiesQuery } from './get-owned-armies-query';

describe('getOwnedArmiesQuery function', () => {
  it(
    'lists unarchived armies for this auth subject, newest first',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ army_id: 'army-1', army_name: 'Legion' }];
      const recorded = recordedSql(produced);
      const rows = await getOwnedArmiesQuery(recorded.sql, 'auth0|owner');
      const call = recorded.calls[0];

      expect(call?.text).toContain('ORDER BY a.created_at DESC');
      expect(call?.values).toStrictEqual(['auth0|owner']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
