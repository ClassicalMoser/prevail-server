import type { ErrorSignature, RequestAuth } from '@ports';
import { missingAuth, requireSubject } from './require-auth';

/**
 * Wrap a route handler that acts for one signed-in player.
 *
 * Owned armies and games belong to the subject, so every such handler starts by
 * reading who is calling and refusing with 401 when nobody is. This does that
 * once; the handler it wraps is only given a subject it can trust.
 *
 * @param run - The handler, given the verified subject and the parsed request.
 * @returns A route handler that answers 401 for a request with no subject.
 */
const withSubject =
  <TRequest, TResult>(
    run: (subject: string, request: TRequest) => Promise<TResult>,
  ) =>
  async (
    request: TRequest,
    auth: RequestAuth | undefined,
  ): Promise<TResult | ErrorSignature> => {
    const subject = requireSubject(auth);
    // Nobody verified: answer 401 and never call the use case, so an anonymous
    // caller reads and writes nothing that belongs to a player.
    if (subject === undefined) {
      return missingAuth;
    }
    const result = await run(subject, request);
    return result;
  };

export { withSubject };
