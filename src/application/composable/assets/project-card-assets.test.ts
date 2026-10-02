import assert from 'node:assert/strict';
import type { AssetStorage, DataErrorSignature } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';
import {
  allCardAssetsExist,
  ensureCardProjection,
  projectCardVersion,
  putRenderedAsset,
} from './project-card-assets';

const target = (key: string): CardAssetTarget => ({
  key,
  type: 'svg',
});

interface RecordingStorage extends AssetStorage {
  putKeys: string[];
}

const recordingStorage = (existing: Set<string>): RecordingStorage => {
  const putKeys: string[] = [];
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

describe('projectCardVersion function', () => {
  it(
    'stops after the first target that fails to render',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const adapter = recordingStorage(new Set());
      const failure: DataErrorSignature<Buffer> = {
        message: 'second failed',
        status: 500,
        success: false,
      };

      const result = await projectCardVersion(
        {
          assetStorage: adapter,
          render: async (_card, next): Promise<DataErrorSignature<Buffer>> => {
            const byKey: Record<string, DataErrorSignature<Buffer>> = {
              'a.svg': { data: Buffer.from('ok'), success: true },
              'b.svg': failure,
              'c.svg': { data: Buffer.from('ok'), success: true },
            };
            const rendered = byKey[next.key];
            assert.ok(rendered !== undefined);
            return rendered;
          },
          targets: () => [target('a.svg'), target('b.svg'), target('c.svg')],
        },
        { id: 'card-1' },
      );

      expect(result).toStrictEqual(failure);
      expect(adapter.putKeys).toStrictEqual(['a.svg']);
    },
  );
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

describe('ensureCardProjection function', () => {
  it('renders only the missing targets', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const adapter = recordingStorage(new Set(['a.svg']));

    const result = await ensureCardProjection(
      {
        assetStorage: adapter,
        render: async (): Promise<DataErrorSignature<Buffer>> => ({
          data: Buffer.from('ok'),
          success: true,
        }),
        targets: () => [target('a.svg'), target('b.svg')],
      },
      { id: 'card-1' },
    );

    expect(result).toStrictEqual({ data: undefined, success: true });
    expect(adapter.putKeys).toStrictEqual(['b.svg']);
  });
});
