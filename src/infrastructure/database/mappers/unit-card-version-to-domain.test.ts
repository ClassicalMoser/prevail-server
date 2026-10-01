import { tempUnits } from '@classicalmoser/prevail-rules/domain';
import type { UnitCardVersionDb } from '../db-types';
import { unitCardVersionMapperToDomain } from './unit-card-version-to-domain';

describe('unitCardVersionMapperToDomain function', () => {
  it(
    'rebuilds the version string from the columns, not the definition',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const unitType = tempUnits[0];
      const row: UnitCardVersionDb = {
        unit_card_id: unitType.id,
        unit_card_version_id: `${unitType.id}-v`,
        unit_card_artwork_url: 'https://assets.example/unit.png',
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

      const mapped = unitCardVersionMapperToDomain(row);

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
