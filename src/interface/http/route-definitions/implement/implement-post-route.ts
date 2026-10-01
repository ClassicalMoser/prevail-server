import type {
  PostRouteContract,
} from './post-route-contract';
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

import {
  tryParseBodyRouteRequest,
} from '../parse-route-request';

import {
  handleError,
} from '@utils';
import {
  jsonSuccessContentType,
} from './json-success-content-type';

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
  successStatus: contract.successStatus,
  successContentType: jsonSuccessContentType,
  invoke: async (wire): Promise<DataErrorSignature<TReturn>> => {
    const parsed = tryParseBodyRouteRequest<TParams, TQuery, TBody, TReturn>(
      wire,
      contract.validators,
    );
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

export { implementPostRoute };
