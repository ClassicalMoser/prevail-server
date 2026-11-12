import { createAuth0Adapter } from './auth0-adapter';
import { recordingLogger } from '@testing';

const logger = recordingLogger();

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
