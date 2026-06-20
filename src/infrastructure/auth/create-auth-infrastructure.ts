import type { AuthPort, LoggerPort } from '@ports';
import { createAuth0Adapter } from './adapters';
import type { AuthInfrastructureConfig } from './auth-config';

const createAuthInfrastructure = (
  logger: LoggerPort,
  config: AuthInfrastructureConfig,
): AuthPort => createAuth0Adapter(logger, config);

export { createAuthInfrastructure };
