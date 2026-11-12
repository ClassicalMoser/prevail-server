import { recordedSql, rowsForStatement } from '@testing';
import { certifyUnitCardVersions } from './certify-unit-card-versions';

describe('certifyUnitCardVersions function', () => {
  it(
    'writes certifications for the latest rules version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql(
        rowsForStatement('FROM rules_versions', [
          { rules_version_id: 'rules-9' },
        ]),
      );

      await expect(
        certifyUnitCardVersions(recorded.sql, ['a']),
      ).resolves.toStrictEqual({
        data: undefined,
        success: true,
      });
      expect(recorded.calls[1]?.values).toStrictEqual(['rules-9', ['a']]);
    },
  );

  it('is a no-op for no ids', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const recorded = recordedSql([]);
    await certifyUnitCardVersions(recorded.sql, []);

    expect(recorded.calls).toStrictEqual([]);
  });
});
