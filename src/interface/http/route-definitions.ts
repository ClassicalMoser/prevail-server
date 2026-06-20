/**
 * Bridges typed route handlers to the HTTP adapter.
 *
 * Each `define*Route` helper pairs an {@link ImplementedGetRoute} (or sibling)
 * with an explicit parser that narrows {@link WireRouteRequest} into the
 * handler's expected request shape. This keeps validation at the HTTP boundary
 * and avoids casts inside handlers.
 */
import type {
  DataErrorSignature,
  GetRouteRequest,
  ImplementedDeleteRoute,
  ImplementedGetRoute,
  ImplementedPatchRoute,
  ImplementedPostRoute,
  ImplementedPutRoute,
  RegisteredRoute,
  RouteRequest,
  WireRouteRequest,
} from '@ports';

/** Pass-through parser for GET routes with no specific params or query shape. */
const parseUnknownGetRequest = (
  wire: WireRouteRequest,
): GetRouteRequest<unknown, unknown> => ({
  params: wire.params,
  query: wire.query,
  headers: wire.headers,
});

/** Pass-through parser for POST routes with no specific params, query, or body shape. */
const parseUnknownPostRequest = (
  wire: WireRouteRequest,
): RouteRequest<unknown, unknown, unknown> => ({
  params: wire.params,
  query: wire.query,
  body: wire.body,
  headers: wire.headers,
});

/**
 * Registers a GET route.
 *
 * @param route - Handler and metadata; use `satisfies ImplementedGetRoute<...>` for contract checking.
 * @param parseRequest - Narrows wire input into the handler's {@link GetRouteRequest}.
 */
const defineGetRoute = <TParams, TQuery, TResponse>(
  route: ImplementedGetRoute<TParams, TQuery, TResponse>,
  parseRequest: (wire: WireRouteRequest) => GetRouteRequest<TParams, TQuery>,
): RegisteredRoute => ({
  method: route.method,
  path: route.path,
  auth: route.auth,
  invoke: (wire): Promise<DataErrorSignature<TResponse>> =>
    route.handler(parseRequest(wire)),
});

/**
 * Registers a POST route.
 *
 * @param route - Handler and metadata; use `satisfies ImplementedPostRoute<...>` for contract checking.
 * @param parseRequest - Narrows wire input into the handler's {@link RouteRequest}.
 */
const definePostRoute = <TParams, TQuery, TBody, TResponse>(
  route: ImplementedPostRoute<TParams, TQuery, TBody, TResponse>,
  parseRequest: (
    wire: WireRouteRequest,
  ) => RouteRequest<TParams, TQuery, TBody>,
): RegisteredRoute => ({
  method: route.method,
  path: route.path,
  auth: route.auth,
  invoke: (wire): Promise<DataErrorSignature<TResponse>> =>
    route.handler(parseRequest(wire)),
});

/** @see definePostRoute */
const definePutRoute = <TParams, TQuery, TBody, TResponse>(
  route: ImplementedPutRoute<TParams, TQuery, TBody, TResponse>,
  parseRequest: (
    wire: WireRouteRequest,
  ) => RouteRequest<TParams, TQuery, TBody>,
): RegisteredRoute => ({
  method: route.method,
  path: route.path,
  auth: route.auth,
  invoke: (wire): Promise<DataErrorSignature<TResponse>> =>
    route.handler(parseRequest(wire)),
});

/** @see definePostRoute */
const definePatchRoute = <TParams, TQuery, TBody, TResponse>(
  route: ImplementedPatchRoute<TParams, TQuery, TBody, TResponse>,
  parseRequest: (
    wire: WireRouteRequest,
  ) => RouteRequest<TParams, TQuery, TBody>,
): RegisteredRoute => ({
  method: route.method,
  path: route.path,
  auth: route.auth,
  invoke: (wire): Promise<DataErrorSignature<TResponse>> =>
    route.handler(parseRequest(wire)),
});

/**
 * Registers a DELETE route.
 *
 * @see defineGetRoute — same pattern, but for DELETE handlers.
 */
const defineDeleteRoute = <TParams, TQuery, TResponse>(
  route: ImplementedDeleteRoute<TParams, TQuery, TResponse>,
  parseRequest: (wire: WireRouteRequest) => GetRouteRequest<TParams, TQuery>,
): RegisteredRoute => ({
  method: route.method,
  path: route.path,
  auth: route.auth,
  invoke: (wire): Promise<DataErrorSignature<TResponse>> =>
    route.handler(parseRequest(wire)),
});

export {
  defineDeleteRoute,
  defineGetRoute,
  definePatchRoute,
  definePostRoute,
  definePutRoute,
  parseUnknownGetRequest,
  parseUnknownPostRequest,
};
