import assert from 'node:assert/strict';
import { unitCardAssetKey, unitCardAssetTargets } from './unit-card-asset-keys';
import { tempUnits } from '@testing';

const unit = tempUnits[0];
assert.ok(unit !== undefined);

describe('unitCardAssetKey function', () => {
  it(
    'builds a unit-kind key for the id and version this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // The unit-card helper fixes the kind to unit, so only the id, version and type vary.
      const key = unitCardAssetKey(unit.id, unit.version, 'svg');

      expect(key).toBe(`cards/unit/svg/${unit.id}_${unit.version}.svg`);
    },
  );
});

describe('unitCardAssetTargets function', () => {
  it(
    'lists every unit asset target for the sample unit',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A unit card has the same three assets as any card: svg, pdf and bleed pdf, with the svg first.
      const targets = unitCardAssetTargets(unit);

      expect(targets).toHaveLength(3);
      expect(targets[0]).toMatchObject({
        key: `cards/unit/svg/${unit.id}_${unit.version}.svg`,
        type: 'svg',
      });
    },
  );
});
