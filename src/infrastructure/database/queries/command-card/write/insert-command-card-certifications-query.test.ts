import { recordedSql } from '@testing';
import { insertCommandCardCertificationsQuery } from './insert-command-card-certifications-query';

describe('insertCommandCardCertificationsQuery function', () => {
  it(
    'certifies the latest version of each card against this rules version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql();
      // One card certified against rules version "rules-1".
      await insertCommandCardCertificationsQuery(
        recorded.sql,
        ['card-1'],
        'rules-1',
      );
      const call = recorded.calls[0];

      expect(call?.text).toContain('INSERT INTO command_card_certifications');
      // The rules version comes first because the statement selects it as a
      // column; the card ids are one array.
      expect(call?.values).toStrictEqual(['rules-1', ['card-1']]);
    },
  );
});
