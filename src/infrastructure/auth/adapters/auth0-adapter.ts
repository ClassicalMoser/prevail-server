import {
  ApiClient,
  InvalidRequestError,
  VerifyAccessTokenError,
} from '@auth0/auth0-api-js';
import type {
  AuthRequired,
  Permission,
} from '@classicalmoser/prevail-contracts';
import { PERMISSIONS } from '@classicalmoser/prevail-contracts';
import type { AuthPort, ErrorSignature, LoggerPort } from '@ports';
import { handleError } from '@utils';
import type { AuthInfrastructureConfig } from '../auth-config';

const unauthorized: ErrorSignature = {
  success: false,
  message: 'Unauthorized',
  status: 401,
};

const forbidden: ErrorSignature = {
  success: false,
  message: 'Forbidden',
  status: 403,
};

const toStringArray = (value: unknown): readonly string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((entry): entry is string => typeof entry === 'string');
};

const knownPermissions = new Set<string>(PERMISSIONS);

const isPermission = (value: string): value is Permission =>
  knownPermissions.has(value);

const toPermissions = (
  claims: Record<string, unknown>,
): readonly Permission[] => {
  const granted = toStringArray(claims.permissions).filter((entry) =>
    isPermission(entry),
  );
  return granted;
};

const hasPermissions = (
  granted: readonly Permission[],
  required: readonly Permission[],
): boolean => {
  if (required.length === 0) {
    return true;
  }

  const grantedSet = new Set(granted);
  return required.every((permission) => grantedSet.has(permission));
};

/**
 * Auth0 access-token check for a route's auth requirement.
 *
 * A verification failure is 401. A token that is valid but missing a required
 * permission is 403. Empty `permissionsRequired` still means the token must
 * verify. Permissions on the token that are not in the contract list are
 * ignored.
 *
 * @param logger - Where unexpected verification failures are recorded.
 * @param config - Auth0 domain and audience.
 * @returns The {@link AuthPort}.
 */
const createAuth0Adapter = (
  logger: LoggerPort,
  config: AuthInfrastructureConfig,
): AuthPort => {
  const apiClient = new ApiClient({
    domain: config.domain,
    audience: config.audience,
  });

  return {
    checkToken: async (token: string, required: AuthRequired) => {
      try {
        const claims = await apiClient.verifyAccessToken({
          accessToken: token,
        });

        if (typeof claims.sub !== 'string') {
          return unauthorized;
        }

        if (
          !hasPermissions(toPermissions(claims), required.permissionsRequired)
        ) {
          return forbidden;
        }

        return { subject: claims.sub };
      } catch (error) {
        if (
          error instanceof VerifyAccessTokenError ||
          error instanceof InvalidRequestError
        ) {
          return unauthorized;
        }

        return handleError({
          error,
          logger,
          context: 'verifying Auth0 access token',
          message: 'Failed to verify Auth0 access token',
          status: 500,
        });
      }
    },
  };
};

export { createAuth0Adapter };
