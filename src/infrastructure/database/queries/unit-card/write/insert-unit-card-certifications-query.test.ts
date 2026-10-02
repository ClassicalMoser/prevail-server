import { recordedSql } from '@testing';
import { insertUnitCardCertificationsQuery } from './insert-unit-card-certifications-query';

describe('insertUnitCardCertificationsQuery function', () => {
  it(
    'certifies the latest version of each unit against this rules version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
      await insertUnitCardCertificationsQuery(
        recorded.sql,
        ['unit-1'],
        'rules-1',
      );
      const call = recorded.calls[0];

      expect(call?.text).toContain('INSERT INTO unit_card_certifications');
      expect(call?.values).toStrictEqual(['rules-1', ['unit-1']]);
    },
  );
});
