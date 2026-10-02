import type { ErrorSignature, RequestAuth } from '@ports';

/** Shared 401 envelope when a protected route has no verified subject. */
const missingAuth: ErrorSignature = {
  success: false,
  message: 'Unauthorized',
  status: 401,
};

/**
 * Read the auth subject from a wire request, if present.
 *
 * @param auth - Request auth from the Fastify preHandler, or undefined.
 * @returns The subject string, or undefined when auth is missing.
 */
const requireSubject = (auth: RequestAuth | undefined): string | undefined => {
  if (auth === undefined) {
    return undefined;
  }
  return auth.subject;
};

export { missingAuth, requireSubject };
