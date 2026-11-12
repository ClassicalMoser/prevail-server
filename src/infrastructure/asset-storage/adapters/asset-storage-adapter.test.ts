import type { S3Client } from '@aws-sdk/client-s3';
import { createAssetStorage } from './asset-storage-adapter';

// send is the one S3Client method the adapter calls, so a mock of it stands in
// for R2.
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

      // A successful head request means the object exists.
      send.mockResolvedValue(undefined as never); // S3 send resolve value is unused
      const storage = createAssetStorage({ bucket: 'assets', client });

      const exists = await storage.objectExists('cards/command/svg/a.svg');

      // The adapter answers the question for a key under the configured bucket.
      expect(exists).toBe(true);
      expect(send).toHaveBeenCalledTimes(1);
    },
  );

  it(
    'delegates putImmutable and reports a successful write',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A successful put means the object was stored.
      send.mockResolvedValue(undefined as never); // S3 send resolve value is unused
      const storage = createAssetStorage({ bucket: 'assets', client });

      const result = await storage.putImmutable(
        'cards/command/svg/a.svg',
        Buffer.from('<svg/>'),
        'svg',
      );

      // The adapter passes along the written outcome.
      expect(result).toStrictEqual({ kind: 'written' });
    },
  );
});
