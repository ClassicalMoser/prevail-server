import { recordedSql } from '@testing';
import { insertCommandCardCertificationsQuery } from './insert-command-card-certifications-query';

describe('insertCommandCardCertificationsQuery function', () => {
  it(
    'certifies the latest version of each card against this rules version',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const recorded = recordedSql();
      await insertCommandCardCertificationsQuery(
        recorded.sql,
        ['card-1'],
        'rules-1',
      );
      const call = recorded.calls[0];

      expect(call?.text).toContain('INSERT INTO command_card_certifications');
      expect(call?.values).toStrictEqual(['rules-1', ['card-1']]);
    },
  );
});
