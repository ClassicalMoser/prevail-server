import type { S3Client } from '@aws-sdk/client-s3';
import { NotFound } from '@aws-sdk/client-s3';
import { objectExists } from './object-exists';

const send = vi.fn<NonNullable<S3Client['send']>>();

const client = { send } as unknown as S3Client;
const bucket = 'test-bucket';

describe('r2 object existence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when the object exists', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    send.mockResolvedValue();

    const result = await objectExists(
      client,
      bucket,
      'cards/command/svg/id_1.svg',
    );

    expect(result).toBe(true);
  });

  it('returns false on 404', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const error = new Error('Not Found') as Error & {
      $metadata: { httpStatusCode: number };
    };
    error.$metadata = { httpStatusCode: 404 };
    send.mockRejectedValue(error);

    const result = await objectExists(
      client,
      bucket,
      'cards/command/svg/id_1.svg',
    );

    expect(result).toBe(false);
  });

  it('returns false on NotFound', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    send.mockRejectedValue(new NotFound({ message: 'missing', $metadata: {} }));

    const result = await objectExists(
      client,
      bucket,
      'cards/command/svg/id_1.svg',
    );

    expect(result).toBe(false);
  });

  it('rethrows non-404 errors', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    send.mockRejectedValue(new Error('network failure'));

    await expect(
      objectExists(client, bucket, 'cards/command/svg/id_1.svg'),
    ).rejects.toThrow('network failure');
  });
});
