import assert from 'node:assert/strict';
import { tempUnits } from '@classicalmoser/prevail-rules/domain';
import type { AssetStorage, UploadResult } from '@ports';
import { allUnitCardAssetsExist } from './all-unit-card-assets-exist';

const unit = tempUnits[0];
assert.ok(unit !== undefined);

const assetStorage = (existing: Set<string>): AssetStorage => ({
  objectExists: async (key): Promise<boolean> => existing.has(key),
  putImmutable: async (key): Promise<UploadResult> => {
    existing.add(key);
    return { kind: 'written' };
  },
});

describe('allUnitCardAssetsExist function', () => {
  it(
    'returns false when any unit asset key is missing',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const exists = await allUnitCardAssetsExist(
        assetStorage(new Set()),
        unit,
      );

      expect(exists).toBe(false);
    },
  );
});
