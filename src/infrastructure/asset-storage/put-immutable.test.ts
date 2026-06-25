import type { AssetType } from '@ports';

const send = vi.fn();

vi.mock('./r2-client', () => ({
  r2: { send },
}));

const { putImmutable } = await import('./put-immutable');

const preconditionFailed = (): Error & {
  $metadata: { httpStatusCode: number };
} => {
  const error = new Error('Precondition Failed') as Error & {
    $metadata: { httpStatusCode: number };
  };
  error.$metadata = { httpStatusCode: 412 };
  return error;
};

describe('putImmutable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.R2_BUCKET = 'test-bucket';
  });

  it('returns written when the object is stored', async () => {
    expect.hasAssertions();

    send.mockResolvedValue({});

    const result = await putImmutable(
      'cards/command/svg/id_1.svg',
      Buffer.from('<svg/>'),
      'svg',
    );

    expect(result).toStrictEqual({ kind: 'written' });
    expect(send).toHaveBeenCalledOnce();
  });

  it('returns already-exists on 412 precondition failed', async () => {
    expect.hasAssertions();

    send.mockRejectedValue(preconditionFailed());

    const result = await putImmutable(
      'cards/command/svg/id_1.svg',
      Buffer.from('<svg/>'),
      'svg',
    );

    expect(result).toStrictEqual({ kind: 'already-exists' });
  });

  it('rethrows non-412 errors', async () => {
    expect.hasAssertions();

    const error = new Error('network failure');
    send.mockRejectedValue(error);

    await expect(
      putImmutable('cards/command/svg/id_1.svg', Buffer.from('<svg/>'), 'svg'),
    ).rejects.toThrow('network failure');
  });

  it.each<[AssetType, string]>([
    ['svg', 'image/svg+xml'],
    ['pdf', 'application/pdf'],
    ['pdf-bleed', 'application/pdf'],
  ])('sets ContentType for %s', async (assetType, contentType) => {
    expect.hasAssertions();

    send.mockResolvedValue({});

    await putImmutable('key', Buffer.from('body'), assetType);

    const command = send.mock.calls[0]?.[0] as {
      input: { ContentType: string };
    };
    expect(command.input.ContentType).toBe(contentType);
  });
});
