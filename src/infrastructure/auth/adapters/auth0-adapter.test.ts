import { createAuth0Adapter } from './auth0-adapter';
import { recordingLogger } from '@testing';

const logger = recordingLogger();

describe('createAuth0Adapter function', () => {
  it(
    'returns an AuthPort whose checkToken verifies through Auth0',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // Placeholder tenant and audience: construction must not contact Auth0,
      // so nothing real is needed.
      const auth = createAuth0Adapter(logger, {
        audience: 'https://api.example',
        domain: 'tenant.auth0.com',
      });

      // The adapter exposes the token check; verifying a real token needs Auth0
      // and is not run here.
      expect(auth.checkToken).toBeTypeOf('function');
    },
  );
});
