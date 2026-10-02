import type { AssetStorage, DataErrorSignature } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';
import { ensureCardProjection } from './ensure-card-projection';

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
