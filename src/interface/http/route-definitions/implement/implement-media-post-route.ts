/**
 * Contract-driven route registration.
 *
 * `implement*Route` helpers derive path, auth, method, and request parsing
 * from the contract validators so handlers only wire use-case calls.
 */

import type {
  MediaContentType,
  MediaPayload,
  MediaPostRoute,
} from '@classicalmoser/prevail-contracts';

import type {
  DataErrorSignature,
  LoggerPort,
  MediaRouteHandler,
  RegisteredRoute,
} from '@ports';

import { tryParseBodyRouteRequest } from '../parse/try-parse-body-route-request';

import { handleError } from '@utils';

/**
 * Register a contract media POST route whose success body is raw bytes.
 *
 * Content-Type comes from the contract (for example `image/svg+xml` for
 * card preview) rather than JSON.
 *
 * @param contract - Media POST contract (path, auth, validators, content type).
 * @param logger - Logger for unexpected handler throws.
 * @param options - Handler that returns a media payload envelope.
 * @returns A {@link RegisteredRoute} for the Fastify registry.
 */
const implementMediaPostRoute = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
  TSuccessContentType extends MediaContentType,
>(
  contract: MediaPostRoute<TParams, TQuery, TBody, TSuccessContentType>,
  logger: LoggerPort,
  {
    handler,
  }: {
    handler: MediaRouteHandler<TParams, TQuery, TBody, TSuccessContentType>;
  },
): RegisteredRoute => ({
  method: contract.method,
  path: contract.path,
  auth: contract.auth,
  successStatus: 200,
  successContentType: contract.successContentType,
  invoke: async (
    wire,
  ): Promise<DataErrorSignature<MediaPayload<TSuccessContentType>>> => {
    const parsed = tryParseBodyRouteRequest(wire, contract.validators);
    if (!parsed.ok) {
      const rejected = parsed.error;
      return rejected;
    }

    try {
      const handled = await handler(parsed.value, wire.auth);
      return handled;
    } catch (error) {
      const failure = handleError({
        error,
        logger,
        context: `handling ${contract.method} on ${contract.path}`,
        message: `Failed to handle ${contract.method} on ${contract.path}`,
        status: 500,
      });
      return failure;
    }
  },
});

export { implementMediaPostRoute };
