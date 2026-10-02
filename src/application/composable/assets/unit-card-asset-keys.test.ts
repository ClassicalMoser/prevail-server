import assert from 'node:assert/strict';
import { tempUnits } from '@classicalmoser/prevail-rules/domain';
import { unitCardAssetKey, unitCardAssetTargets } from './unit-card-asset-keys';

const unit = tempUnits[0];
assert.ok(unit !== undefined);

describe('unitCardAssetKey function', () => {
  it(
    'builds a unit-kind key for the id and version this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

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

      const targets = unitCardAssetTargets(unit);

      expect(targets).toHaveLength(3);
      expect(targets[0]).toMatchObject({
        key: `cards/unit/svg/${unit.id}_${unit.version}.svg`,
        type: 'svg',
      });
    },
  );
});
