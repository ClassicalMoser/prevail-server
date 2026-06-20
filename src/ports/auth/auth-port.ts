import type { AuthRequired } from '@classicalmoser/prevail-contracts';
import type { ErrorSignature } from '@ports/data-error-signature-port';

export interface AuthPort {
  checkToken: (
    token: string,
    required: AuthRequired,
  ) => Promise<true | ErrorSignature>;
}
