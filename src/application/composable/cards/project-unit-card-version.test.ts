import assert from 'node:assert/strict';
import { tempUnits } from '@classicalmoser/prevail-rules/domain';
import type { AssetStorage, UnitCardRendererPort, UploadResult } from '@ports';
import {
  allUnitCardAssetsExist,
  projectUnitCardVersion,
} from './project-unit-card-version';

const unit = tempUnits[0];
assert.ok(unit !== undefined);

const assetStorage = (existing: Set<string>): AssetStorage => ({
  objectExists: async (key): Promise<boolean> => existing.has(key),
  putImmutable: async (key): Promise<UploadResult> => {
    existing.add(key);
    return { kind: 'written' };
  },
});

const renderer = (): UnitCardRendererPort => ({
  renderUnitCard: async (): Promise<{
    data: Buffer;
    success: true;
  }> => ({
    data: Buffer.from('svg'),
    success: true,
  }),
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

describe('projectUnitCardVersion function', () => {
  it(
    'renders and stores every unit asset target',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const existing = new Set<string>();
      const result = await projectUnitCardVersion(
        {
          assetStorage: assetStorage(existing),
          unitCardRenderer: renderer(),
        },
        unit,
      );

      expect(result).toStrictEqual({ data: undefined, success: true });
      expect(existing.size).toBe(3);
    },
  );
});
