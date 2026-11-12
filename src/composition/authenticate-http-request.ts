import type { AuthRequired } from '@classicalmoser/prevail-contracts';
import type { AuthPort, ErrorSignature } from '@ports';
import { extractBearerToken } from '@utils';

const unauthorized: ErrorSignature = {
  success: false,
  message: 'Unauthorized',
  status: 401,
};

/**
 * Check the bearer token of a request to a route that needs auth.
 *
 * A request with no bearer token is 401. A token the auth port refuses answers
 * the port's own error, so an expired token and a token missing a permission
 * are told apart.
 *
 * @param authPort - Verifies a token against the route's required permissions.
 * @param auth - The route's auth requirement, including its required permissions.
 * @param headers - The request's normalized headers.
 * @returns The verified subject, or the error to send.
 */
const authenticateHttpRequest = async (
  authPort: AuthPort,
  auth: AuthRequired,
  headers: Readonly<Record<string, string | undefined>>,
): Promise<{ subject: string } | ErrorSignature> => {
  const token = extractBearerToken(headers);
  if (token === undefined) {
    return unauthorized;
  }

  const authResult = await authPort.checkToken(token, auth);
  // An error envelope has `success`; a verified caller has only a subject.
  if ('success' in authResult) {
    return authResult;
  }
  const caller = { subject: authResult.subject };
  return caller;
};

export { authenticateHttpRequest };
