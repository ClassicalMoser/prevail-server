/**
 * Contract-driven route registration.
 *
 * `implement*Route` helpers derive path, auth, method, and request parsing
 * from the contract validators so handlers only wire use-case calls.
 */

import type {
  DeleteRoute,
} from '@classicalmoser/prevail-contracts';

import type {
  DeleteRouteHandler,
  LoggerPort,
  RegisteredRoute,
  RouteInvokeResult,
} from '@ports';

import {
  tryParseDeleteRequest,
} from '../parse-route-request';

import {
  handleError,
} from '@utils';
import {
  jsonSuccessContentType,
} from './json-success-content-type';

const implementDeleteRoute = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
>(
  contract: DeleteRoute<TParams, TQuery>,
  logger: LoggerPort,
  { handler }: { handler: DeleteRouteHandler<TParams, TQuery> },
): RegisteredRoute => ({
  method: contract.method,
  path: contract.path,
  auth: contract.auth,
  successStatus: 204,
  successContentType: jsonSuccessContentType,
  invoke: async (wire): Promise<RouteInvokeResult> => {
    const parsed = tryParseDeleteRequest(wire, contract.validators);
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

export { implementDeleteRoute };
