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

      const options = createCorsOptions(['https://app.example']);

      expect(options).toStrictEqual({
        allowedHeaders: [...CORS_ALLOWED_HEADERS],
        credentials: true,
        maxAge: CORS_PREFLIGHT_MAX_AGE_SECONDS,
        methods: [...CORS_ALLOWED_METHODS],
        origin: ['https://app.example'],
      });
      expect(options.methods).toContain('DELETE');
    },
  );
});
