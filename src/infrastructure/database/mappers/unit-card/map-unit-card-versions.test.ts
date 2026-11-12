import { mapUnitCardVersions } from './map-unit-card-versions';

describe('mapUnitCardVersions function', () => {
  it('maps no rows to no unit types', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(mapUnitCardVersions([])).toStrictEqual([]);
  });
});
