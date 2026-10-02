import assert from 'node:assert/strict';
import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  CommandCardRendererPort,
  UploadResult,
} from '@ports';
import {
  allCommandCardAssetsExist,
  projectCommandCardVersion,
} from './project-command-card-version';
import {
  buildPlaceholderUnitIdToNameMap,
  getCommandCardUnitIds,
} from './replace-command-card-ids-with-names';

const card = tempCommandCards[0];
assert.ok(card !== undefined);

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

describe('allCommandCardAssetsExist function', () => {
  it(
    'returns false when any command asset key is missing',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const exists = await allCommandCardAssetsExist(
        assetStorage(new Set()),
        card,
      );

      expect(exists).toBe(false);
    },
  );
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
          unitIdToNameMap: buildPlaceholderUnitIdToNameMap(
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
