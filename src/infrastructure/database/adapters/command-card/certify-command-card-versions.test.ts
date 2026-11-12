import { recordedSql, rowsForStatement } from '@testing';
import { certifyCommandCardVersions } from './certify-command-card-versions';

describe('certifyCommandCardVersions function', () => {
  it(
    'writes certifications for the latest rules version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The rules_versions read answers rules-9 as the newest rules release.
      const recorded = recordedSql(
        rowsForStatement('FROM rules_versions', [
          { rules_version_id: 'rules-9' },
        ]),
      );

      await expect(
        certifyCommandCardVersions(recorded.sql, ['a']),
      ).resolves.toStrictEqual({
        data: undefined,
        success: true,
      });
      // The second statement is the certification insert: rules version first,
      // then the card ids.
      expect(recorded.calls[1]?.values).toStrictEqual(['rules-9', ['a']]);
    },
  );

  it('is a no-op for no ids', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // No rows are scripted; an empty id list must not reach the database.
    const recorded = recordedSql([]);
    await certifyCommandCardVersions(recorded.sql, []);

    // Nothing is certified and no statement ran.
    expect(recorded.calls).toStrictEqual([]);
  });
});
