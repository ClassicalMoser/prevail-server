import type { AssetStorage, DataErrorSignature } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';
import { putRenderedAsset } from './put-rendered-asset';

const target = (key: string): CardAssetTarget => ({
  key,
  type: 'svg',
});

interface RecordingStorage extends AssetStorage {
  putKeys: string[];
}

const recordingStorage = (existing: Set<string>): RecordingStorage => {
  const putKeys: string[] = [];
  // Storage starts empty and records every file written.
  const adapter: RecordingStorage = {
    objectExists: async (key): Promise<boolean> => existing.has(key),
    putImmutable: async (key) => {
      putKeys.push(key);
      existing.add(key);
      return { kind: 'written' as const };
    },
    putKeys,
  };
  return adapter;
};

describe('putRenderedAsset function', () => {
  it(
    'returns a render failure without writing storage',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const adapter = recordingStorage(new Set());
      // The renderer has already failed, so there is nothing valid to store.
      const renderFailure: DataErrorSignature<Buffer> = {
        message: 'render failed',
        status: 500,
        success: false,
      };

      const result = await putRenderedAsset(
        adapter,
        target('cards/command/svg/a.svg'),
        renderFailure,
      );

      // The failure is returned as it came, and nothing was written under the target key.
      expect(result).toStrictEqual(renderFailure);
      expect(adapter.putKeys).toStrictEqual([]);
    },
  );

  it(
    'stores the rendered buffer under the target key',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const adapter = recordingStorage(new Set());

      // A successful render is stored under the key the target names.
      const result = await putRenderedAsset(
        adapter,
        target('cards/command/svg/a.svg'),
        { data: Buffer.from('svg'), success: true },
      );

      expect(result).toStrictEqual({ data: undefined, success: true });
      expect(adapter.putKeys).toStrictEqual(['cards/command/svg/a.svg']);
    },
  );
});
