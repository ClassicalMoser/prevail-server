import type { S3Client } from '@aws-sdk/client-s3';
import { NotFound } from '@aws-sdk/client-s3';
import { objectExists } from './object-exists';

// send is the one S3Client method this module calls, so a mock of it stands in
// for R2.
const send = vi.fn<NonNullable<S3Client['send']>>();

const client = { send } as unknown as S3Client; // S3Client needs a full client; this suite only calls send
const bucket = 'test-bucket';

describe('r2 object existence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when the object exists', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // A head request that succeeds means the rendered card is already stored.
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

    // An AWS-shaped error whose $metadata says 404.
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

    // The SDK's own NotFound error class, which carries no 404 in $metadata.
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

    // A failure that is not 'missing' must not be read as 'absent', or a card
    // could be rendered and overwritten while R2 is down.
    send.mockRejectedValue(new Error('network failure'));

    await expect(
      objectExists(client, bucket, 'cards/command/svg/id_1.svg'),
    ).rejects.toThrow('network failure');
  });
});
