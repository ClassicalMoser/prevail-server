/**
 * Contract-driven route registration.
 *
 * `implement*Route` helpers derive path, auth, method, and request parsing
 * from the contract validators so handlers only wire use-case calls.
 */

import type {
  GetRoute,
} from '@classicalmoser/prevail-contracts';

import type {
  DataErrorSignature,
  GetRouteHandler,
  LoggerPort,
  RegisteredRoute,
} from '@ports';

import {
  tryParseGetRequest,
} from '../parse-route-request';

import {
  handleError,
} from '@utils';
import {
  jsonSuccessContentType,
} from './json-success-content-type';

const implementGetRoute = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TReturn,
>(
  contract: GetRoute<TParams, TQuery, TReturn>,
  logger: LoggerPort,
  { handler }: { handler: GetRouteHandler<TParams, TQuery, TReturn> },
): RegisteredRoute => ({
  method: contract.method,
  path: contract.path,
  auth: contract.auth,
  successStatus: 200,
  successContentType: jsonSuccessContentType,
  invoke: async (wire): Promise<DataErrorSignature<TReturn>> => {
    const parsed = tryParseGetRequest(wire, contract.validators);
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

export { implementGetRoute };
