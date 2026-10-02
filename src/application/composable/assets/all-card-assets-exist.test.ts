import type { AssetStorage } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';
import { allCardAssetsExist } from './all-card-assets-exist';

const target = (key: string): CardAssetTarget => ({
  key,
  type: 'svg',
});

const recordingStorage = (existing: Set<string>): AssetStorage => ({
  objectExists: async (key): Promise<boolean> => existing.has(key),
  putImmutable: async (): Promise<{ kind: 'written' }> => ({
    kind: 'written' as const,
  }),
});

describe('allCardAssetsExist function', () => {
  it(
    'returns false when any target key is missing',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const adapter = recordingStorage(new Set(['a.svg']));

      const exists = await allCardAssetsExist(
        {
          assetStorage: adapter,
          targets: () => [target('a.svg'), target('b.svg')],
        },
        { id: 'card-1' },
      );

      expect(exists).toBe(false);
    },
  );
});
