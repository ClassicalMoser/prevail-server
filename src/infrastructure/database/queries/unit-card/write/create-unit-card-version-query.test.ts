import { recordedSql } from '@testing';
import { createUnitCardVersionQuery } from './create-unit-card-version-query';

describe('createUnitCardVersionQuery function', () => {
  it(
    'inserts the name, artwork, version, and definition this test set',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const produced = [{ unit_card_id: 'unit-1' }];
      // A recorded tag stands in for postgres; the test pins the statement
      // shape, not database behaviour.
      const recorded = recordedSql(produced);
      // A version row as the author writes it: no artwork yet (null) and the
      // definition already serialized JSON.
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

      // Publishing a card adds a new version row; earlier versions stay.
      expect(call?.text).toContain('INSERT INTO unit_card_versions');
      // Bound in statement order (id, name, artwork, version triple,
      // definition), which differs from the row's key order.
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
