import type { S3Client } from '@aws-sdk/client-s3';
import { createAssetStorage } from './asset-storage-adapter';

const send = vi.fn<NonNullable<S3Client['send']>>();

const client = { send } as unknown as S3Client; // S3Client needs a full client; this suite only calls send

describe('createAssetStorage function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    'delegates objectExists through the configured bucket',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      send.mockResolvedValue(undefined as never); // S3 send resolve value is unused
      const storage = createAssetStorage({ bucket: 'assets', client });

      const exists = await storage.objectExists('cards/command/svg/a.svg');

      expect(exists).toBe(true);
      expect(send).toHaveBeenCalledTimes(1);
    },
  );

  it(
    'delegates putImmutable and reports a successful write',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      send.mockResolvedValue(undefined as never); // S3 send resolve value is unused
      const storage = createAssetStorage({ bucket: 'assets', client });

      const result = await storage.putImmutable(
        'cards/command/svg/a.svg',
        Buffer.from('<svg/>'),
        'svg',
      );

      expect(result).toStrictEqual({ kind: 'written' });
    },
  );
});
