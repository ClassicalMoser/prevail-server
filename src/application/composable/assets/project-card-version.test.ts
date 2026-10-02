import assert from 'node:assert/strict';
import type { AssetStorage, DataErrorSignature } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';
import { projectCardVersion } from './project-card-version';

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
