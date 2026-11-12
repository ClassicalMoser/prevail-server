import { recordedSql } from '@testing';
import { archiveOwnedArmy } from './archive-owned-army';

describe('archiveOwnedArmy function', () => {
  it(
    'succeeds when a live army of the subject was archived',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The archive statement returns the army id, meaning one live army of
      // this subject was archived.
      const recorded = recordedSql([{ army_id: 'army-1' }]);

      await expect(
        archiveOwnedArmy(recorded.sql, 'auth0|a', 'army-1'),
      ).resolves.toStrictEqual({
        data: undefined,
        success: true,
      });
    },
  );

  it(
    'answers 404 when no live army of the subject matched',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        // No row comes back: the army is missing, archived already, or someone
        // else's, and the caller cannot tell which.
        archiveOwnedArmy(recordedSql([]).sql, 'auth0|a', 'army-1'),
      ).resolves.toStrictEqual({
        message: 'Army not found',
        status: 404,
        success: false,
      });
    },
  );
});
