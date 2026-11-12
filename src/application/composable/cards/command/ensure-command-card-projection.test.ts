import assert from 'node:assert/strict';
import type {
  AssetStorage,
  CommandCardRendererPort,
  UploadResult,
} from '@ports';
import { commandCardAssetTargets } from '@application/composable/assets/command-card-asset-keys';
import type { UnitIdToNameMap } from '../print/unit-id-to-name-map';
import { getCommandCardUnitIds } from '../print/get-command-card-unit-ids';
import { ensureCommandCardProjection } from './ensure-command-card-projection';
import { tempCommandCards } from '@testing';

const card = tempCommandCards[0];
assert.ok(card !== undefined);

const placeholderUnitIdToNameMap = (unitIds: string[]): UnitIdToNameMap =>
  new Map(unitIds.map((id) => [id, `NAME_${id.slice(0, 5)}...`]));

const assetStorage = (existing: Set<string>): AssetStorage => ({
  objectExists: async (key): Promise<boolean> => existing.has(key),
  putImmutable: async (key): Promise<UploadResult> => {
    existing.add(key);
    return { kind: 'written' };
  },
});

const renderer = (): CommandCardRendererPort => ({
  renderCommandCard: async (): Promise<{
    data: Buffer;
    success: true;
  }> => ({
    data: Buffer.from('svg'),
    success: true,
  }),
});

describe('ensureCommandCardProjection function', () => {
  it(
    'renders only missing command asset targets',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // One of the card's three files is already stored, so only the other two should be drawn.
      const [firstTarget] = commandCardAssetTargets(card);
      assert.ok(firstTarget !== undefined);
      const existing = new Set<string>([firstTarget.key]);
      const beforeSize = existing.size;

      // A stub renderer and placeholder unit names are enough: the test counts files stored, not their content.
      const result = await ensureCommandCardProjection(
        {
          assetStorage: assetStorage(existing),
          commandCardRenderer: renderer(),
          unitIdToNameMap: placeholderUnitIdToNameMap(
            getCommandCardUnitIds(card),
          ),
        },
        card,
      );

      expect(result).toStrictEqual({ data: undefined, success: true });
      // The set grew past the one file it started with, and now holds all three.
      expect(existing.size).toBeGreaterThan(beforeSize);
      expect(existing.size).toBe(3);
    },
  );
});
