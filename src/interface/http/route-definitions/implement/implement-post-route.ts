import type { PostRouteContract } from './post-route-contract';
/**
 * Contract-driven route registration.
 *
 * `implement*Route` helpers derive path, auth, method, and request parsing
 * from the contract validators so handlers only wire use-case calls.
 */

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
 * Register a contract POST route: parse params/query/body, then invoke the handler.
 *
 * @param contract - POST contract (path, auth, validators, success status).
 * @param logger - Logger for unexpected handler throws.
 * @param options - Handler that receives the parsed request and auth.
 * @returns A {@link RegisteredRoute} for the Fastify registry.
 */
const implementPostRoute = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
  TReturn,
>(
  contract: PostRouteContract<TParams, TQuery, TBody, TReturn>,
  logger: LoggerPort,
  { handler }: { handler: RouteHandler<TParams, TQuery, TBody, TReturn> },
): RegisteredRoute => ({
  method: contract.method,
  path: contract.path,
  auth: contract.auth,
  // 201 for a create route, 200 otherwise, as the contract declares.
  successStatus: contract.successStatus,
  successContentType: jsonSuccessContentType,
  invoke: async (wire): Promise<DataErrorSignature<TReturn>> => {
    // The handler only ever sees params, query and body the contract's schemas
    // accept; a bad request is answered 400 here and never reaches a use case.
    const parsed = tryParseBodyRouteRequest<TParams, TQuery, TBody, TReturn>(
      wire,
      contract.validators,
    );
    if (!parsed.ok) {
      const rejected = parsed.error;
      return rejected;
    }

    try {
      // Auth is set on the wire request only for routes whose contract requires it,
      // after the token was verified; a client cannot supply it.
      const handled = await handler(parsed.value, wire.auth);
      return handled;
    } catch (error) {
      // A throw is a bug, not a refusal: it is logged, and the caller gets only a
      // generic 500 whose message never carries the thrown text.
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

export { implementPostRoute };
