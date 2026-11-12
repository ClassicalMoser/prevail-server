import type { AuthPort, WsRouteRegistry } from '@ports';
import { extractAccessToken } from '@utils';

/** The verified caller of a socket route. */
interface WsUpgradeAuth {
  subject: string;
}

/**
 * Decide whether an upgrading socket may connect to a route.
 *
 * A route that needs auth gets the Authorization header's token, or the
 * `access_token` query value when the client cannot set headers (browsers).
 * A missing or rejected token closes the socket with 1008 (policy violation)
 * before any game handler runs.
 *
 * @param input - The auth port, the request's headers and query, the route, and how to close.
 * @returns The caller, `'anonymous'` for a route that needs no auth, or `'closed'` once refused.
 */
const authenticateWsUpgrade = async (input: {
  authPort: AuthPort;
  headers: Readonly<Record<string, string | undefined>>;
  query: Record<string, string | string[] | undefined>;
  route: WsRouteRegistry[number];
  close: (code: number, reason: string) => void;
}): Promise<WsUpgradeAuth | 'closed' | 'anonymous'> => {
  // A route whose contract needs no auth admits anyone, and its handlers get no
  // caller.
  if (!input.route.auth.authRequired) {
    return 'anonymous';
  }
  // A browser cannot set Authorization on a socket, so extractAccessToken also
  // reads the access_token query value.
  const token = extractAccessToken(input.headers, input.query);
  if (token === undefined) {
    // No token: refuse before any game is touched. 1008 (policy violation) is the
    // socket counterpart of HTTP 401.
    input.close(1008, 'Unauthorized');
    return 'closed';
  }
  // The same AuthPort as HTTP, so an expired token and a token missing a
  // permission are refused the same way on both transports.
  const authResult = await input.authPort.checkToken(token, input.route.auth);
  // An error envelope has `success`; a verified caller has only a subject.
  if ('success' in authResult) {
    // The port's own message is the close reason, so the client can tell an
    // expired token from a missing permission.
    input.close(1008, authResult.message);
    return 'closed';
  }
  const caller: WsUpgradeAuth = { subject: authResult.subject };
  return caller;
};

export type { WsUpgradeAuth };
export { authenticateWsUpgrade };
