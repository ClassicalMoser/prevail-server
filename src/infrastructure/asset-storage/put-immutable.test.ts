import type { S3Client } from '@aws-sdk/client-s3';
import type { AssetType } from '@ports';
import { putImmutable } from './put-immutable';

const send = vi.fn<NonNullable<S3Client['send']>>();

const client = { send } as unknown as S3Client;
const bucket = 'test-bucket';

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

      send.mockResolvedValue();

      const result = await putImmutable({
        client,
        bucket,
        key: 'cards/command/svg/id_1.svg',
        body: Buffer.from('<svg/>'),
        assetType: 'svg',
      });

      expect(result).toStrictEqual({ kind: 'written' });
      expect(send).toHaveBeenCalledTimes(1);
    },
  );

  it(
    'returns already-exists on 412 precondition failed',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      send.mockRejectedValue(preconditionFailed());

      const result = await putImmutable({
        client,
        bucket,
        key: 'cards/command/svg/id_1.svg',
        body: Buffer.from('<svg/>'),
        assetType: 'svg',
      });

      expect(result).toStrictEqual({ kind: 'already-exists' });
    },
  );

  it('rethrows non-412 errors', { timeout: 5000 }, async () => {
    expect.hasAssertions();

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

      const command = send.mock.calls[0]?.[0] as {
        input: { ContentType: string };
      };
      expect(command.input.ContentType).toBe(contentType);
    },
  );
});
