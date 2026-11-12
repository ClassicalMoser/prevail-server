import { assertAllowedMediaOrigin } from './assert-allowed-media-origin';

describe('allowed media origin validation', () => {
  // The one origin the server is configured to fetch unit artwork from.
  const allowedOrigin = 'https://assets.example.com';

  it('accepts a URL with the configured origin', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A URL on the allowed origin passes.
    expect(
      assertAllowedMediaOrigin(
        'https://assets.example.com/unit.png',
        allowedOrigin,
      ),
    ).toStrictEqual({ success: true });
  });

  it('rejects a URL from another origin', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // The server fetches artwork URLs that authors supply, so another origin is
    // refused with 400 rather than fetched.
    expect(
      assertAllowedMediaOrigin(
        'https://evil.example.com/unit.png',
        allowedOrigin,
      ),
    ).toStrictEqual({
      success: false,
      message: 'Image URL origin is not allowed',
      status: 400,
    });
  });
});
