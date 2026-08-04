import { assertAllowedMediaOrigin } from './assert-allowed-media-origin';

describe('allowed media origin validation', () => {
  const allowedOrigin = 'https://assets.example.com';

  it('accepts a URL with the configured origin', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      assertAllowedMediaOrigin(
        'https://assets.example.com/unit.png',
        allowedOrigin,
      ),
    ).toStrictEqual({ success: true });
  });

  it('rejects a URL from another origin', { timeout: 5000 }, () => {
    expect.hasAssertions();

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
