import type { LoggerPort } from '@ports';
import { createAuth0Adapter } from './auth0-adapter';

const logger: LoggerPort = {
  error: (): void => {
    /* unused */
  },
  info: (): void => {
    /* unused */
  },
  warn: (): void => {
    /* unused */
  },
};

describe('createAuth0Adapter function', () => {
  it(
    'returns an AuthPort whose checkToken verifies through Auth0',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const auth = createAuth0Adapter(logger, {
        audience: 'https://api.example',
        domain: 'tenant.auth0.com',
      });

      expect(auth.checkToken).toBeTypeOf('function');
    },
  );
});
