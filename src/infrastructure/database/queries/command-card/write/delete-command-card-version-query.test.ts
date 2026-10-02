import { recordedSql } from '@testing';
import { deleteCommandCardVersionQuery } from './delete-command-card-version-query';

describe('deleteCommandCardVersionQuery function', () => {
  it(
    'deletes the command card version triple this test named',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
      await deleteCommandCardVersionQuery({
        sql: recorded.sql,
        commandCardId: 'card-1',
        versionMajor: 1,
        versionMinor: 2,
        versionPatch: 3,
      });
      const call = recorded.calls[0];

      expect(call?.text).toContain('DELETE FROM command_card_versions');
      expect(call?.values).toStrictEqual(['card-1', 1, 2, 3]);
    },
  );
});
