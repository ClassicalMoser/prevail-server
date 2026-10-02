import type { AuthPort, LoggerPort } from '@ports';
import { createAuth0Adapter } from './adapters';
import type { AuthInfrastructureConfig } from './auth-config';

/**
 * Build the Auth0-backed auth port used by HTTP and WebSocket registration.
 *
 * @param logger - Logger for token validation failures.
 * @param config - Auth0 domain and audience.
 * @returns Auth port for bearer verification and permission checks.
 */
const createAuthInfrastructure = (
  logger: LoggerPort,
  config: AuthInfrastructureConfig,
): AuthPort => createAuth0Adapter(logger, config);

export { createAuthInfrastructure };
