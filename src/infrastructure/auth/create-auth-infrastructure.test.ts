import { createAuthInfrastructure } from './create-auth-infrastructure';
import { recordingLogger } from '@testing';

const logger = recordingLogger();

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
