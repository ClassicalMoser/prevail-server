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
      // The tag records the UPDATE; connectionClient wraps it as the SqlClient
      // the query expects.
      const recorded = recordedSql(produced);
      const client = connectionClient(recorded.sql);
      const rows = await updateArmyQuery(client, {
        armyId: 'army-1',
        userId: 'user-1',
        armyName: 'Renamed',
      });
      const call = recorded.calls[0];

      expect(call?.text).toContain('UPDATE armies');
      // An archived army is not renamed: the WHERE keeps the update to live
      // armies.
      expect(call?.text).toContain('archived_at IS NULL');
      // New name, army id, then owner id: the owner id in the WHERE means
      // another player cannot rename this army.
      expect(call?.values).toStrictEqual(['Renamed', 'army-1', 'user-1']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
