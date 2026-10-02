import assert from 'node:assert/strict';
import { tempUnits } from '@classicalmoser/prevail-rules/domain';
import type { AssetStorage, UnitCardRendererPort, UploadResult } from '@ports';
import { unitCardAssetTargets } from '@application/composable/assets/unit-card-asset-keys';
import { ensureUnitCardProjection } from './ensure-unit-card-projection';

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

describe('ensureUnitCardProjection function', () => {
  it('renders only missing unit asset targets', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const [firstTarget] = unitCardAssetTargets(unit);
    assert.ok(firstTarget !== undefined);
    const existing = new Set<string>([firstTarget.key]);
    const beforeSize = existing.size;

    const result = await ensureUnitCardProjection(
      {
        assetStorage: assetStorage(existing),
        unitCardRenderer: renderer(),
      },
      unit,
    );

    expect(result).toStrictEqual({ data: undefined, success: true });
    expect(existing.size).toBeGreaterThan(beforeSize);
    expect(existing.size).toBe(3);
  });
});
