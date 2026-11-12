import { recordedSql } from '@testing';
import { getLatestCommandCardCertificationsQuery } from './get-latest-command-card-certifications-query';

describe('getLatestCommandCardCertificationsQuery function', () => {
  it(
    'joins certification to the highest rules version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ command_card_id: 'card-1', certified: true }];
      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql(produced);
      const rows = await getLatestCommandCardCertificationsQuery(recorded.sql);
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
