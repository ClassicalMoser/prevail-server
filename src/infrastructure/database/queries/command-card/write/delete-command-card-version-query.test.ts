import { recordedSql } from '@testing';
import { deleteCommandCardVersionQuery } from './delete-command-card-version-query';

describe('deleteCommandCardVersionQuery function', () => {
  it(
    'deletes the command card version triple this test named',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql();
      // Version 1.2.3 of one card, named as a triple.
      await deleteCommandCardVersionQuery({
        sql: recorded.sql,
        commandCardId: 'card-1',
        versionMajor: 1,
        versionMinor: 2,
        versionPatch: 3,
      });
      const call = recorded.calls[0];

      expect(call?.text).toContain('DELETE FROM command_card_versions');
      // Card id then major, minor, patch: only that one version is removed.
      expect(call?.values).toStrictEqual(['card-1', 1, 2, 3]);
    },
  );
});
