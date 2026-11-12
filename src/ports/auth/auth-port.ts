import type { AuthRequired } from '@classicalmoser/prevail-contracts';
import type { ErrorSignature } from '@ports/data-error-signature-port';

/** Authenticated principal extracted from a verified access token. */
interface AuthSuccess {
  subject: string;
}

/**
 * Verifies an access token for a route's required permissions.
 * An error envelope (401 expired or invalid, 403 missing permission) is the refusal;
 * otherwise the token's subject identifies the caller.
 */
interface AuthPort {
  checkToken: (
    token: string,
    required: AuthRequired,
  ) => Promise<AuthSuccess | ErrorSignature>;
}

export type { AuthPort, AuthSuccess };
