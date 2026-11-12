import { createAuthInfrastructure } from './create-auth-infrastructure';
import { recordingLogger } from '@testing';

const logger = recordingLogger();

describe('createAuthInfrastructure function', () => {
  it(
    'returns an AuthPort with checkToken from the Auth0 adapter',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // Placeholder tenant and audience: construction must not contact Auth0,
      // so nothing real is needed.
      const auth = createAuthInfrastructure(logger, {
        audience: 'https://api.example',
        domain: 'tenant.auth0.com',
      });

      // The port the server uses to verify bearer tokens is present; verifying
      // a real token needs Auth0 and is not run here.
      expect(auth.checkToken).toBeTypeOf('function');
    },
  );
});
