import { readAllowedMediaOrigin } from './read-allowed-media-origin';

describe('readAllowedMediaOrigin function', () => {
  it('answers a valid origin', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      readAllowedMediaOrigin({
        ALLOWED_MEDIA_ORIGIN: 'https://media.example.com',
      }),
    ).toBe('https://media.example.com');
  });

  it('refuses a value that is not a URL', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(() =>
      readAllowedMediaOrigin({ ALLOWED_MEDIA_ORIGIN: 'not a url' }),
    ).toThrow('ALLOWED_MEDIA_ORIGIN must be a valid URL origin');
  });

  it('names the variable when it is missing', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(() => readAllowedMediaOrigin({})).toThrow(
      'ALLOWED_MEDIA_ORIGIN is not set',
    );
  });
});
