import { recordedSql } from '@testing';
import { createCommandCardVersionQuery } from './create-command-card-version-query';

describe('createCommandCardVersionQuery function', () => {
  it(
    'inserts the name, version, and definition this test set',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ command_card_id: 'card-1' }];
      const recorded = recordedSql(produced);
      const writeVersion = {
        command_card_id: 'card-1',
        command_card_name: 'Charge',
        command_card_definition: '{"initiative":1}',
        version_major: 1,
        version_minor: 0,
        version_patch: 0,
      };
      const rows = await createCommandCardVersionQuery(
        recorded.sql,
        writeVersion,
      );
      const call = recorded.calls[0];

      expect(call?.text).toContain('INSERT INTO command_card_versions');
      expect(call?.values).toStrictEqual([
        'card-1',
        'Charge',
        1,
        0,
        0,
        '{"initiative":1}',
      ]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
