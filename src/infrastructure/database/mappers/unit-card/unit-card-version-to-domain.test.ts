import type { UnitCardVersionDb } from '@infrastructure/database/db-types';
import { unitCardVersionMapperToDomain } from './unit-card-version-to-domain';
import { tempUnits } from '@testing';

describe('unitCardVersionMapperToDomain function', () => {
  it(
    'rebuilds the version string from the columns, not the definition',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A catalog unit type; its fields fill a database row's definition
      // column.
      const unitType = tempUnits[0];
      const row: UnitCardVersionDb = {
        unit_card_id: unitType.id,
        unit_card_version_id: `${unitType.id}-v`,
        unit_card_artwork_url: 'https://assets.example/unit.png',
        // The row's name and artwork column differ from the catalog unit, so
        // the test shows the columns win.
        unit_card_name: 'Renamed',
        unit_card_definition: {
          traits: unitType.traits,
          stats: unitType.stats,
          cost: unitType.cost,
          limit: 4,
          morale: unitType.morale,
        },
        version_major: 8,
        version_minor: 0,
        version_patch: 1,
      };

      // Version columns 8.0.1 are not written anywhere in the definition.
      const mapped = unitCardVersionMapperToDomain(row);

      // Name, image and version come from the columns; limit comes from the
      // definition.
      expect(mapped).toMatchObject({
        id: unitType.id,
        name: 'Renamed',
        imageUrl: 'https://assets.example/unit.png',
        version: '8.0.1',
        limit: 4,
      });
    },
  );
});
