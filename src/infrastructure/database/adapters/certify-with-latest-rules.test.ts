import { recordedSql, rowsForStatement } from '@testing';
import { certifyWithLatestRules } from './certify-with-latest-rules';

/** An insert the test does not look at. */
const skipInsert = async (): Promise<void> => {
  /* Unused by this test. */
};

describe('certifyWithLatestRules function', () => {
  it(
    'certifies against the newest rules version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const inserted: unknown[] = [];
      const recorded = recordedSql(
        rowsForStatement('FROM rules_versions', [
          { rules_version_id: 'rules-9' },
        ]),
      );

      await expect(
        certifyWithLatestRules(
          recorded.sql,
          ['card-1'],
          async (_sql, ids, rulesVersionId) => {
            inserted.push([ids, rulesVersionId]);
          },
        ),
      ).resolves.toStrictEqual({ data: undefined, success: true });
      expect(inserted).toStrictEqual([[['card-1'], 'rules-9']]);
    },
  );

  it(
    'does nothing for an empty list, without asking for rules',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();

      await expect(
        certifyWithLatestRules(recorded.sql, [], skipInsert),
      ).resolves.toStrictEqual({ data: undefined, success: true });
      expect(recorded.calls).toStrictEqual([]);
    },
  );

  it(
    'answers 500 when there is no rules version to certify against',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        certifyWithLatestRules(recordedSql([]).sql, ['card-1'], skipInsert),
      ).resolves.toStrictEqual({
        message: 'No rules version found',
        status: 500,
        success: false,
      });
    },
  );
});
