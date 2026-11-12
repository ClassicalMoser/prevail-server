import {
  CORS_ALLOWED_HEADERS,
  CORS_ALLOWED_METHODS,
  CORS_PREFLIGHT_MAX_AGE_SECONDS,
  createCorsOptions,
} from './cors-options';

describe('createCorsOptions function', () => {
  it(
    'allows the origins this test named with credentials and DELETE',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // One allowed origin chosen by the test.
      const options = createCorsOptions(['https://app.example']);

      // The options carry exactly the named origin, the shared header and
      // method lists, and credentials, so the browser can send tokens.
      expect(options).toStrictEqual({
        allowedHeaders: [...CORS_ALLOWED_HEADERS],
        credentials: true,
        maxAge: CORS_PREFLIGHT_MAX_AGE_SECONDS,
        methods: [...CORS_ALLOWED_METHODS],
        origin: ['https://app.example'],
      });
      // DELETE is among the methods: delete-empty routes need it.
      expect(options.methods).toContain('DELETE');
    },
  );
});
