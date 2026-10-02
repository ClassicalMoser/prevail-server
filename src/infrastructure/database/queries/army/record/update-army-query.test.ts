import { recordedSql } from '@testing';
import { connectionClient } from '@infrastructure/database/connection-client';
import { updateArmyQuery } from './update-army-query';

describe('updateArmyQuery function', () => {
  it(
    'renames the live army owned by this user',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [
        {
          army_id: 'army-1',
          army_name: 'Renamed',
          user_id: 'user-1',
          public: true,
          archived_at: null,
        },
      ];
      const recorded = recordedSql(produced);
      const client = connectionClient(recorded.sql);
      const rows = await updateArmyQuery(client, {
        armyId: 'army-1',
        userId: 'user-1',
        armyName: 'Renamed',
      });
      const call = recorded.calls[0];

      expect(call?.text).toContain('UPDATE armies');
      expect(call?.text).toContain('archived_at IS NULL');
      expect(call?.values).toStrictEqual(['Renamed', 'army-1', 'user-1']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
