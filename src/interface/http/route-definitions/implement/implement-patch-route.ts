/**
 * Contract-driven route registration.
 *
 * `implement*Route` helpers derive path, auth, method, and request parsing
 * from the contract validators so handlers only wire use-case calls.
 */

import type { PatchRoute } from '@classicalmoser/prevail-contracts';

import type {
  DataErrorSignature,
  LoggerPort,
  RegisteredRoute,
  RouteHandler,
} from '@ports';

import { tryParseBodyRouteRequest } from '../parse/try-parse-body-route-request';

import { handleError } from '@utils';
import { jsonSuccessContentType } from './json-success-content-type';

/**
 * Register a contract PATCH route: parse params/query/body, then invoke the handler.
 *
 * @param contract - PATCH contract (path, auth, validators).
 * @param logger - Logger for unexpected handler throws.
 * @param options - Handler that receives the parsed request and auth.
 * @returns A {@link RegisteredRoute} for the Fastify registry.
 */
const implementPatchRoute = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
  TReturn,
>(
  contract: PatchRoute<TParams, TQuery, TBody, TReturn>,
  logger: LoggerPort,
  { handler }: { handler: RouteHandler<TParams, TQuery, TBody, TReturn> },
): RegisteredRoute => ({
  method: contract.method,
  path: contract.path,
  auth: contract.auth,
  successStatus: 200,
  successContentType: jsonSuccessContentType,
  invoke: async (wire): Promise<DataErrorSignature<TReturn>> => {
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

export { implementPatchRoute };
