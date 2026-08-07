import type { AuthRequired } from '@classicalmoser/prevail-contracts';
import type { ErrorSignature } from '@ports/data-error-signature-port';

/** Authenticated principal extracted from a verified access token. */
interface AuthSuccess {
  subject: string;
}

export interface AuthPort {
  checkToken: (
    token: string,
    required: AuthRequired,
  ) => Promise<AuthSuccess | ErrorSignature>;
}

export type { AuthSuccess };
