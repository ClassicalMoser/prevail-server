import { recordedSql } from '@testing';
import { getLatestRulesVersionIdQuery } from './get-latest-rules-version-id-query';

describe('getLatestRulesVersionIdQuery function', () => {
  it('reads the highest rules version id', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const produced = [{ rules_version_id: 'rules-1' }];
    // A recorded tag stands in for postgres; the test pins the statement shape,
    // not database behaviour.
    const recorded = recordedSql(produced);
    const rows = await getLatestRulesVersionIdQuery(recorded.sql);
    const call = recorded.calls[0];

    // Major, then minor, then patch, each descending: the newest rules release
    // comes first.
    expect(call?.text).toContain(
      'ORDER BY version_major DESC, version_minor DESC, version_patch DESC',
    );
    expect(call?.values).toStrictEqual([]);
    expect(rows).toStrictEqual(produced);
  });
});
