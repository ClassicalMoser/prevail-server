import { recordedSql } from '@testing';
import { createUnitCardVersionQuery } from './create-unit-card-version-query';

describe('createUnitCardVersionQuery function', () => {
  it(
    'inserts the name, artwork, version, and definition this test set',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ unit_card_id: 'unit-1' }];
      const recorded = recordedSql(produced);
      const writeVersion = {
        unit_card_id: 'unit-1',
        unit_card_name: 'Hastati',
        unit_card_artwork_url: null,
        unit_card_definition: '{"name":"Hastati"}',
        version_major: 1,
        version_minor: 0,
        version_patch: 0,
      };
      const rows = await createUnitCardVersionQuery(recorded.sql, writeVersion);
      const call = recorded.calls[0];

      expect(call?.text).toContain('INSERT INTO unit_card_versions');
      expect(call?.values).toStrictEqual([
        'unit-1',
        'Hastati',
        null,
        1,
        0,
        0,
        '{"name":"Hastati"}',
      ]);
      expect(rows).toStrictEqual(produced);
    },
  );
});
