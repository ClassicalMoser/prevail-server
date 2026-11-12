import type { S3Client } from '@aws-sdk/client-s3';
import type { AssetType } from '@ports';
import { putImmutable } from './put-immutable';

// send is the one S3Client method this module calls, so a mock of it stands in
// for R2.
const send = vi.fn<NonNullable<S3Client['send']>>();

const client = { send } as unknown as S3Client; // S3Client needs a full client; this suite only calls send
const bucket = 'test-bucket';

// R2's answer when the key already exists under a create-only write: HTTP 412.
const preconditionFailed = (): Error & {
  $metadata: { httpStatusCode: number };
} => {
  const error = new Error('Precondition Failed') as Error & {
    $metadata: { httpStatusCode: number };
  };
  error.$metadata = { httpStatusCode: 412 };
  return error;
};

describe('r2 immutable put', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    'returns written when the object is stored',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The store accepts the object.
      send.mockResolvedValue();

      const result = await putImmutable({
        client,
        bucket,
        key: 'cards/command/svg/id_1.svg',
        body: Buffer.from('<svg/>'),
        assetType: 'svg',
      });

      // A fresh key is reported as written, with one request sent.
      expect(result).toStrictEqual({ kind: 'written' });
      expect(send).toHaveBeenCalledTimes(1);
    },
  );

  it(
    'returns already-exists on 412 precondition failed',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The key was already written by an earlier render.
      send.mockRejectedValue(preconditionFailed());

      const result = await putImmutable({
        client,
        bucket,
        key: 'cards/command/svg/id_1.svg',
        body: Buffer.from('<svg/>'),
        assetType: 'svg',
      });

      // A versioned asset is never overwritten: a 412 is the expected 'already
      // stored' answer, not a failure.
      expect(result).toStrictEqual({ kind: 'already-exists' });
    },
  );

  it('rethrows non-412 errors', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // Any other error is a real failure and must reach the caller.
    const error = new Error('network failure');
    send.mockRejectedValue(error);

    await expect(
      putImmutable({
        client,
        bucket,
        key: 'cards/command/svg/id_1.svg',
        body: Buffer.from('<svg/>'),
        assetType: 'svg',
      }),
    ).rejects.toThrow('network failure');
  });

  // Each asset type maps to the content type the browser needs to display it.
  it.each<[AssetType, string]>([
    ['svg', 'image/svg+xml'],
    ['pdf', 'application/pdf'],
    ['pdf-bleed', 'application/pdf'],
  ])(
    'sets ContentType for %s',
    { timeout: 5000 },
    async (assetType, contentType) => {
      expect.hasAssertions();

      send.mockResolvedValue();

      await putImmutable({
        client,
        bucket,
        key: 'key',
        body: Buffer.from('body'),
        assetType,
      });

      // The command passed to send carries the ContentType the object is stored
      // with.
      const command = send.mock.calls[0]?.[0] as {
        input: { ContentType: string };
      };
      expect(command.input.ContentType).toBe(contentType);
    },
  );
});
