import { recordedSql } from '@testing';
import { createArmyQuery } from './create-army-query';

describe('createArmyQuery function', () => {
  it(
    'inserts the army under this user and returns the new row',
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
      const recorded = recordedSql(produced);
      const rows = await createArmyQuery(recorded.sql, {
        userId: 'user-1',
        armyName: 'Legion',
      });
      const call = recorded.calls[0];

      expect(call?.text).toContain('INSERT INTO armies');
      expect(call?.values).toStrictEqual(['user-1', 'Legion']);
      expect(rows).toStrictEqual(produced);
    },
  );
});
