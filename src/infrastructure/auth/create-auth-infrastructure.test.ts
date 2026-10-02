import type { LoggerPort } from '@ports';
import { createAuthInfrastructure } from './create-auth-infrastructure';

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

describe('createAuthInfrastructure function', () => {
  it(
    'returns an AuthPort with checkToken from the Auth0 adapter',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const auth = createAuthInfrastructure(logger, {
        audience: 'https://api.example',
        domain: 'tenant.auth0.com',
      });

      expect(auth.checkToken).toBeTypeOf('function');
    },
  );
});
