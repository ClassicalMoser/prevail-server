import { recordedSql } from '@testing';
import { getLatestCommandCardCertificationsQuery } from './get-latest-command-card-certifications-query';

describe('getLatestCommandCardCertificationsQuery function', () => {
  it(
    'joins certification to the highest rules version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ command_card_id: 'card-1', certified: true }];
      const recorded = recordedSql(produced);
      const rows = await getLatestCommandCardCertificationsQuery(recorded.sql);
      const call = recorded.calls[0];

      expect(call?.text).toContain('FROM rules_versions');
      expect(call?.values).toStrictEqual([]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
