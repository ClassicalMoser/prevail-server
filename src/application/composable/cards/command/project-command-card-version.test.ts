import assert from 'node:assert/strict';
import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  CommandCardRendererPort,
  UploadResult,
} from '@ports';
import type { UnitIdToNameMap } from '../print/unit-id-to-name-map';
import { getCommandCardUnitIds } from '../print/get-command-card-unit-ids';
import { projectCommandCardVersion } from './project-command-card-version';

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

describe('projectCommandCardVersion function', () => {
  it(
    'renders and stores every command asset target',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const existing = new Set<string>();
      const result = await projectCommandCardVersion(
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
      expect(existing.size).toBe(3);
    },
  );
});
