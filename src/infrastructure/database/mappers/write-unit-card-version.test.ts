import { tempUnits } from '@classicalmoser/prevail-rules/domain';
import { writeUnitCardVersionMapper } from './write-unit-card-version';

describe('writeUnitCardVersionMapper function', () => {
  it(
    'writes the version triple and the limit this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const unitType = {
        ...tempUnits[0],
        version: '3.2.1',
        limit: 4,
      };
      const write = writeUnitCardVersionMapper(unitType);
      const definition: unknown = JSON.parse(write.unit_card_definition);

      expect(write).toMatchObject({
        unit_card_id: unitType.id,
        unit_card_name: unitType.name,
        unit_card_artwork_url: unitType.imageUrl,
        version_major: 3,
        version_minor: 2,
        version_patch: 1,
      });
      expect(definition).toMatchObject({ limit: 4 });
    },
  );
});
