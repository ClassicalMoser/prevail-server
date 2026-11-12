import { recordedSql } from '@testing';
import { renameOwnedArmy } from './rename-owned-army';

const rename = { armyId: 'army-1', armyName: 'Legion', userId: 'user-1' };
const row = {
  army_id: 'army-1',
  army_name: 'Legion',
  user_id: 'user-1',
  public: false,
  archived_at: null,
};

describe('renameOwnedArmy function', () => {
  it(
    'is true when a live army of this owner was renamed',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([row]);

      await expect(
        renameOwnedArmy({ kind: 'connection', sql: recorded.sql }, rename),
      ).resolves.toBe(true);
    },
  );

  it(
    'is false when no live army of this owner matched',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql([]);

      await expect(
        renameOwnedArmy({ kind: 'connection', sql: recorded.sql }, rename),
      ).resolves.toBe(false);
    },
  );
});
