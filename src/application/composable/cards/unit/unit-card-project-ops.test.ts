import assert from 'node:assert/strict';
import type {
  AssetStorage,
  DataErrorSignature,
  UnitCardRendererPort,
  UploadResult,
} from '@ports';
import { unitCardProjectOps } from './unit-card-project-ops';
import { tempUnits } from '@testing';

const unit = tempUnits[0];
assert.ok(unit !== undefined);

const assetStorage = (): AssetStorage => ({
  objectExists: async (): Promise<boolean> => false,
  putImmutable: async (): Promise<UploadResult> => ({ kind: 'written' }),
});

describe('unitCardProjectOps function', () => {
  it(
    'renders through the unit card renderer for each target',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // Counts calls to the unit card renderer, to show the ops draw through it.
      let renderCalls = 0;
      const unitCardRenderer: UnitCardRendererPort = {
        renderUnitCard: async (): Promise<DataErrorSignature<Buffer>> => {
          renderCalls += 1;
          return { data: Buffer.from('svg'), success: true };
        },
      };

      const ops = unitCardProjectOps({
        assetStorage: assetStorage(),
        unitCardRenderer,
      });

      // Take the first target; one render for it is enough to show where the drawing is sent.
      const [target] = ops.targets(unit);
      assert.ok(target !== undefined);
      const result = await ops.render(unit, target);

      expect(result.success).toBe(true);
      expect(renderCalls).toBe(1);
    },
  );
});
