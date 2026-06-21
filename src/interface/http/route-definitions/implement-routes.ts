/**
 * Contract-driven route registration.
 *
 * `implement*Route` helpers derive path, auth, method, and request parsing
 * from the contract validators so handlers only wire use-case calls.
 */
import type {
  CreatedPostRoute,
  DeleteRoute,
  GetRoute,
  MediaContentType,
  MediaPayload,
  MediaPostRoute,
  PatchRoute,
  PostRoute,
  PutRoute,
} from '@classicalmoser/prevail-contracts';
import type {
  DataErrorSignature,
  DeleteRouteHandler,
  GetRouteHandler,
  MediaRouteHandler,
  RegisteredRoute,
  RouteHandler,
  RouteInvokeResult,
} from '@ports';
import {
  tryParseBodyRouteRequest,
  tryParseDeleteRequest,
  tryParseGetRequest,
} from './parse-route-request';

const jsonSuccessContentType = 'application/json' as const;

const implementGetRoute = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TReturn,
>(
  contract: GetRoute<TParams, TQuery, TReturn>,
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
      return parsed.error;
    }

    return handler(parsed.value);
  },
});

type PostRouteContract<
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
  TReturn,
> =
  | PostRoute<TParams, TQuery, TBody, TReturn>
  | CreatedPostRoute<TParams, TQuery, TBody, TReturn>;

const implementPostRoute = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
  TReturn,
>(
  contract: PostRouteContract<TParams, TQuery, TBody, TReturn>,
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
      return parsed.error;
    }

    return handler(parsed.value);
  },
});

const implementPutRoute = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
  TReturn,
>(
  contract: PutRoute<TParams, TQuery, TBody, TReturn>,
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
      return parsed.error;
    }

    return handler(parsed.value);
  },
});

const implementPatchRoute = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
  TReturn,
>(
  contract: PatchRoute<TParams, TQuery, TBody, TReturn>,
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
      return parsed.error;
    }

    return handler(parsed.value);
  },
});

const implementDeleteRoute = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
>(
  contract: DeleteRoute<TParams, TQuery>,
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
      return parsed.error;
    }

    return handler(parsed.value);
  },
});

const implementMediaPostRoute = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
  TSuccessContentType extends MediaContentType,
>(
  contract: MediaPostRoute<TParams, TQuery, TBody, TSuccessContentType>,
  {
    handler,
  }: {
    handler: MediaRouteHandler<
      TParams,
      TQuery,
      TBody,
      TSuccessContentType
    >;
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
      return parsed.error;
    }

    return handler(parsed.value);
  },
});

export {
  implementDeleteRoute,
  implementGetRoute,
  implementMediaPostRoute,
  implementPatchRoute,
  implementPostRoute,
  implementPutRoute,
};
