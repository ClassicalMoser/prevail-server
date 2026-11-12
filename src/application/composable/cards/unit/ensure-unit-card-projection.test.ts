import assert from 'node:assert/strict';
import type { AssetStorage, UnitCardRendererPort, UploadResult } from '@ports';
import { unitCardAssetTargets } from '@application/composable/assets/unit-card-asset-keys';
import { ensureUnitCardProjection } from './ensure-unit-card-projection';
import { tempUnits } from '@testing';

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

    // One of the unit's three files is already stored, so only the other two should be drawn.
    const [firstTarget] = unitCardAssetTargets(unit);
    assert.ok(firstTarget !== undefined);
    const existing = new Set<string>([firstTarget.key]);
    const beforeSize = existing.size;

    // The renderer is a stub that returns a tiny buffer; the test counts files stored, not their content.
    const result = await ensureUnitCardProjection(
      {
        assetStorage: assetStorage(existing),
        unitCardRenderer: renderer(),
      },
      unit,
    );

    expect(result).toStrictEqual({ data: undefined, success: true });
    // The set grew past the one file it started with, and now holds all three.
    expect(existing.size).toBeGreaterThan(beforeSize);
    expect(existing.size).toBe(3);
  });
});
