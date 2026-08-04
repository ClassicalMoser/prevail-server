import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const { fetchUnitArtwork } = await import('./fetch-unit-artwork');

describe('fetchUnitArtwork', () => {
  const allowedOrigin = 'https://assets.example.com';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it(
    'writes the response body to the destination path',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const dir = await mkdtemp(path.join(tmpdir(), 'unit-artwork-'));
      const destinationPath = path.join(dir, 'unit-image.png');
      const body = Buffer.from('png-bytes');

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: {
            get: vi.fn<(name: string) => string | null>(),
          },
          arrayBuffer: async () => body,
        }),
      );

      const result = await fetchUnitArtwork(
        'https://assets.example.com/unit.png',
        destinationPath,
        allowedOrigin,
      );

      expect(result).toStrictEqual({ success: true, data: true });
      await expect(readFile(destinationPath)).resolves.toStrictEqual(body);
    },
  );

  it(
    'rejects artwork from a disallowed origin',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const result = await fetchUnitArtwork(
        'https://evil.example.com/unit.png',
        '/tmp/unit-image.png',
        allowedOrigin,
      );

      expect(result).toStrictEqual({
        success: false,
        message: 'Image URL origin is not allowed',
        status: 400,
      });
    },
  );

  it(
    'rejects redirects',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 302,
          statusText: 'Found',
          headers: {
            get: vi.fn<(name: string) => string | null>(),
          },
        }),
      );

      const result = await fetchUnitArtwork(
        'https://assets.example.com/redirect.png',
        '/tmp/unit-image.png',
        allowedOrigin,
      );

      expect(result).toStrictEqual({
        success: false,
        message: 'Redirects are not allowed for unit artwork',
        status: 400,
      });
    },
  );

  it(
    'returns an error when the response is not ok',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          headers: {
            get: vi.fn<(name: string) => string | null>(),
          },
        }),
      );

      const result = await fetchUnitArtwork(
        'https://assets.example.com/missing.png',
        '/tmp/unit-image.png',
        allowedOrigin,
      );

      expect(result).toStrictEqual({
        success: false,
        message: 'Failed to fetch unit artwork (404 Not Found)',
        status: 500,
      });
    },
  );

  it('returns an error when fetch throws', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network down')),
    );

    const result = await fetchUnitArtwork(
      'https://assets.example.com/unit.png',
      '/tmp/unit-image.png',
      allowedOrigin,
    );

    expect(result).toStrictEqual({
      success: false,
      message: 'network down',
      status: 500,
    });
  });
});
