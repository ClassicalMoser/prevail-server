import { recordedSql } from '@testing';
import { getLatestUnitCardCertificationsQuery } from './get-latest-unit-card-certifications-query';

describe('getLatestUnitCardCertificationsQuery function', () => {
  it(
    'joins unit certification to the highest rules version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ unit_card_id: 'unit-1', certified: true }];
      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql(produced);
      const rows = await getLatestUnitCardCertificationsQuery(recorded.sql);
      const call = recorded.calls[0];

      // Certification is judged against the newest rules version, so a rules
      // change makes older certifications stale.
      expect(call?.text).toContain('FROM rules_versions');
      // Nothing is bound: the latest rules version is found inside the
      // statement.
      expect(call?.values).toStrictEqual([]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
