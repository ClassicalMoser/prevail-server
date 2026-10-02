import { recordedSql } from '@testing';
import { getLatestUnitCardCertificationsQuery } from './get-latest-unit-card-certifications-query';

describe('getLatestUnitCardCertificationsQuery function', () => {
  it(
    'joins unit certification to the highest rules version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ unit_card_id: 'unit-1', certified: true }];
      const recorded = recordedSql(produced);
      const rows = await getLatestUnitCardCertificationsQuery(recorded.sql);
      const call = recorded.calls[0];

      expect(call?.text).toContain('FROM rules_versions');
      expect(call?.values).toStrictEqual([]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
