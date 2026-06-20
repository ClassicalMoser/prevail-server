import type {
  DeleteRoute,
  GetRoute,
  PatchRoute,
  PostRoute,
  PutRoute,
  RouteAuth,
} from '@classicalmoser/prevail-contracts';
import type { DataErrorSignature } from './data-error-signature-port';

/**
 * Untyped request shape produced by the HTTP adapter (Fastify).
 *
 * Every field is `unknown` because the adapter has not validated or narrowed
 * anything yet. Route-specific parsers (passed to `defineGetRoute`, etc.)
 * are responsible for producing a typed request before the handler runs.
 */
interface WireRouteRequest {
  params: unknown;
  query: unknown;
  body: unknown;
  headers: Readonly<Record<string, string | undefined>>;
}

/** Typed request for routes that accept a body (POST, PUT, PATCH). */
interface RouteRequest<TParams, TQuery, TBody> {
  params: TParams;
  query: TQuery;
  body: TBody;
  headers: Readonly<Record<string, string | undefined>>;
}

/**
 * Typed request for routes that do not accept a body (GET, DELETE).
 *
 * Omits `body` entirely rather than using `never`, which would prevent the
 * HTTP adapter from passing its wire request through without casts.
 */
interface GetRouteRequest<TParams, TQuery> {
  params: TParams;
  query: TQuery;
  headers: Readonly<Record<string, string | undefined>>;
}

type RouteHandler<TParams, TQuery, TBody, TResponse> = (
  request: RouteRequest<TParams, TQuery, TBody>,
) => Promise<DataErrorSignature<TResponse>>;

type GetRouteHandler<TParams, TQuery, TResponse> = (
  request: GetRouteRequest<TParams, TQuery>,
) => Promise<DataErrorSignature<TResponse>>;

type DeleteRouteHandler<TParams, TQuery, TResponse> = (
  request: GetRouteRequest<TParams, TQuery>,
) => Promise<DataErrorSignature<TResponse>>;

/**
 * Server-side route definition checked against a prevail-contracts route.
 *
 * Use with `satisfies ImplementedGetRoute<...>` at the call site so the
 * handler signature is validated without widening inferred types.
 */
type ImplementedGetRoute<TParams, TQuery, TResponse> = Pick<
  GetRoute<TParams, TQuery, TResponse>,
  'path' | 'auth' | 'method'
> & {
  handler: GetRouteHandler<TParams, TQuery, TResponse>;
};

/** @see ImplementedGetRoute */
type ImplementedPostRoute<TParams, TQuery, TBody, TResponse> = Pick<
  PostRoute<TParams, TQuery, TBody, TResponse>,
  'path' | 'auth' | 'method'
> & {
  handler: RouteHandler<TParams, TQuery, TBody, TResponse>;
};

/** @see ImplementedGetRoute */
type ImplementedPutRoute<TParams, TQuery, TBody, TResponse> = Pick<
  PutRoute<TParams, TQuery, TBody, TResponse>,
  'path' | 'auth' | 'method'
> & {
  handler: RouteHandler<TParams, TQuery, TBody, TResponse>;
};

/** @see ImplementedGetRoute */
type ImplementedPatchRoute<TParams, TQuery, TBody, TResponse> = Pick<
  PatchRoute<TParams, TQuery, TBody, TResponse>,
  'path' | 'auth' | 'method'
> & {
  handler: RouteHandler<TParams, TQuery, TBody, TResponse>;
};

/** @see ImplementedGetRoute */
type ImplementedDeleteRoute<TParams, TQuery, TResponse> = Pick<
  DeleteRoute<TParams, TQuery, TResponse>,
  'path' | 'auth' | 'method'
> & {
  handler: DeleteRouteHandler<TParams, TQuery, TResponse>;
};

/**
 * A route ready for registration with the HTTP adapter.
 *
 * Handlers on {@link ImplementedGetRoute} and siblings are typed per-route,
 * but the registry must accept heterogeneous routes. `invoke` erases those
 * differences by always accepting a {@link WireRouteRequest}; the route's
 * parser (supplied when calling `defineGetRoute`, etc.) runs inside `invoke`.
 */
interface RegisteredRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  auth: RouteAuth;
  invoke: (request: WireRouteRequest) => Promise<DataErrorSignature<unknown>>;
}

/** Collection of routes passed to `registerRoutes`. */
type RouteRegistry = readonly RegisteredRoute[];

export type {
  DeleteRouteHandler,
  GetRouteHandler,
  GetRouteRequest,
  ImplementedDeleteRoute,
  ImplementedGetRoute,
  ImplementedPatchRoute,
  ImplementedPostRoute,
  ImplementedPutRoute,
  RegisteredRoute,
  RouteHandler,
  RouteRegistry,
  RouteRequest,
  WireRouteRequest,
};
