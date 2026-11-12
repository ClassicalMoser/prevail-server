import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const { fetchUnitArtwork } = await import('./fetch-unit-artwork');

describe('fetchUnitArtwork', () => {
  // The only origin artwork may be fetched from.
  const allowedOrigin = 'https://assets.example.com';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it(
    'writes the response body to the destination path',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A temporary folder stands in for the render workspace the artwork is
      // saved into.
      const dir = await mkdtemp(path.join(tmpdir(), 'unit-artwork-'));
      const destinationPath = path.join(dir, 'unit-image.png');
      const body = Buffer.from('png-bytes');

      // A stubbed fetch answers 200 with the body, so no network is used.
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

      // The fetch reports success.
      expect(result).toStrictEqual({ success: true, data: true });
      // The bytes written equal the response body.
      await expect(readFile(destinationPath)).resolves.toStrictEqual(body);
    },
  );

  it(
    'rejects artwork from a disallowed origin',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const result = await fetchUnitArtwork(
        // A URL on another origin: it is refused before any request is made.
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

  it('rejects redirects', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // A 302 answer stands for a redirect to somewhere else.
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

    // Artwork is only taken from the allowed origin, so a redirect, which could
    // lead off it, is refused with 400.
    expect(result).toStrictEqual({
      success: false,
      message: 'Redirects are not allowed for unit artwork',
      status: 400,
    });
  });

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
        // A URL the allowed origin answers with 404.
        'https://assets.example.com/missing.png',
        '/tmp/unit-image.png',
        allowedOrigin,
      );

      // A missing image is the server's failure to render, status 500, with the
      // upstream status in the message.
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
      // A network error stands for the artwork host being unreachable.
      vi.fn().mockRejectedValue(new Error('network down')),
    );

    const result = await fetchUnitArtwork(
      'https://assets.example.com/unit.png',
      '/tmp/unit-image.png',
      allowedOrigin,
    );

    // The thrown error's message is passed back, with status 500.
    expect(result).toStrictEqual({
      success: false,
      message: 'network down',
      status: 500,
    });
  });
});
