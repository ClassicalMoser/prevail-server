import { recordedSql } from '@testing';
import { archiveArmyQuery } from './archive-army-query';

describe('archiveArmyQuery function', () => {
  it(
    'archives the live army owned by this auth subject',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ army_id: 'army-1' }];
      const recorded = recordedSql(produced);
      const rows = await archiveArmyQuery(
        recorded.sql,
        'auth0|owner',
        'army-1',
      );
      const call = recorded.calls[0];

      expect(call?.text).toContain('SET archived_at = now()');
      expect(call?.values).toStrictEqual(['army-1', 'auth0|owner']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
