import { recordedSql } from '@testing';
import { insertUnitCardCertificationsQuery } from './insert-unit-card-certifications-query';

describe('insertUnitCardCertificationsQuery function', () => {
  it(
    'certifies the latest version of each unit against this rules version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql();
      // One unit certified against rules version "rules-1".
      await insertUnitCardCertificationsQuery(
        recorded.sql,
        ['unit-1'],
        'rules-1',
      );
      const call = recorded.calls[0];

      expect(call?.text).toContain('INSERT INTO unit_card_certifications');
      // The rules version comes first because the statement selects it as a
      // column; the card ids are one array.
      expect(call?.values).toStrictEqual(['rules-1', ['unit-1']]);
    },
  );
});
