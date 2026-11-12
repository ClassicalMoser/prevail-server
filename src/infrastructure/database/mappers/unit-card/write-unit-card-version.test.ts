import { writeUnitCardVersionMapper } from './write-unit-card-version';
import { tempUnits } from '@testing';

describe('writeUnitCardVersionMapper function', () => {
  it(
    'writes the version triple and the limit this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A catalog unit type with version '3.2.1' and a unit limit of 4 chosen
      // by the test.
      const unitType = {
        ...tempUnits[0],
        version: '3.2.1',
        limit: 4,
      };
      const write = writeUnitCardVersionMapper(unitType);
      // The definition column is stored as JSON text; parsed back to read the
      // limit.
      const definition: unknown = JSON.parse(write.unit_card_definition);

      // Name and artwork are columns, and the dotted version is split into
      // three.
      expect(write).toMatchObject({
        unit_card_id: unitType.id,
        unit_card_name: unitType.name,
        unit_card_artwork_url: unitType.imageUrl,
        version_major: 3,
        version_minor: 2,
        version_patch: 1,
      });
      // The unit limit lives inside the JSON definition.
      expect(definition).toMatchObject({ limit: 4 });
    },
  );
});
