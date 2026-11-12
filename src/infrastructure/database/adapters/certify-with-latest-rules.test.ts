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

      // The insert is a recording stand-in, so the test sees which ids and
      // rules version certification was given.
      const inserted: unknown[] = [];
      // The rules_versions read answers one row, rules-9, as if it were the
      // newest rules release.
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
      // The card was certified against the rules version the query returned,
      // not a fixed one.
      expect(inserted).toStrictEqual([[['card-1'], 'rules-9']]);
    },
  );

  it(
    'does nothing for an empty list, without asking for rules',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // No rows are scripted: with nothing to certify, no query may run at all.
      const recorded = recordedSql();

      await expect(
        certifyWithLatestRules(recorded.sql, [], skipInsert),
      ).resolves.toStrictEqual({ data: undefined, success: true });
      // No statement was sent, not even the rules lookup.
      expect(recorded.calls).toStrictEqual([]);
    },
  );

  it(
    'answers 500 when there is no rules version to certify against',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        // With no rules version row, certification cannot happen: the server
        // reports its own fault as 500, not a client error.
        certifyWithLatestRules(recordedSql([]).sql, ['card-1'], skipInsert),
      ).resolves.toStrictEqual({
        message: 'No rules version found',
        status: 500,
        success: false,
      });
    },
  );
});
