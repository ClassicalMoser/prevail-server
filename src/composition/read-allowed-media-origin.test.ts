import { readAllowedMediaOrigin } from './read-allowed-media-origin';

describe('readAllowedMediaOrigin function', () => {
  it('answers a valid origin', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      readAllowedMediaOrigin({
        // The origin the server may fetch unit artwork from.
        ALLOWED_MEDIA_ORIGIN: 'https://media.example.com',
      }),
    ).toBe('https://media.example.com');
  });

  it('refuses a value that is not a URL', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(() =>
      // A value that is not a URL is a configuration mistake: start-up fails
      // rather than allowing artwork from anywhere.
      readAllowedMediaOrigin({ ALLOWED_MEDIA_ORIGIN: 'not a url' }),
    ).toThrow('ALLOWED_MEDIA_ORIGIN must be a valid URL origin');
  });

  it('names the variable when it is missing', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // With nothing set, the error names the variable so the operator knows what
    // to add.
    expect(() => readAllowedMediaOrigin({})).toThrow(
      'ALLOWED_MEDIA_ORIGIN is not set',
    );
  });
});
