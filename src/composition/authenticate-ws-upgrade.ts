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
  if (!input.route.auth.authRequired) {
    return 'anonymous';
  }
  const token = extractAccessToken(input.headers, input.query);
  if (token === undefined) {
    input.close(1008, 'Unauthorized');
    return 'closed';
  }
  const authResult = await input.authPort.checkToken(token, input.route.auth);
  // An error envelope has `success`; a verified caller has only a subject.
  if ('success' in authResult) {
    input.close(1008, authResult.message);
    return 'closed';
  }
  const caller: WsUpgradeAuth = { subject: authResult.subject };
  return caller;
};

export type { WsUpgradeAuth };
export { authenticateWsUpgrade };
