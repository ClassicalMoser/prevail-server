import type {
  MediaContentType,
  MediaPayload,
  RouteAuth,
} from '@classicalmoser/prevail-contracts';
import type {
  DataErrorSignature,
  ErrorSignature,
  NoContentSignature,
  RouteInvokeResult,
} from './data-error-signature-port';

/** Auth identity attached after a successful `AuthPort.checkToken`. */
interface RequestAuth {
  subject: string;
}

/**
 * Untyped request shape produced by the HTTP adapter (Fastify).
 *
 * Fields are `unknown` until contract validators parse them inside an
 * `implement*Route` `invoke` method.
 */
interface WireRouteRequest {
  params: unknown;
  query: unknown;
  body: unknown;
  headers: Readonly<Record<string, string | undefined>>;
  /** Present when the route required auth and verification succeeded. */
  auth?: RequestAuth;
}

/** Validated request for routes that accept a body (POST, PUT, PATCH). */
interface RouteRequest<TParams, TQuery, TBody> {
  params: TParams;
  query: TQuery;
  body: TBody;
  headers: Readonly<Record<string, string | undefined>>;
}

/**
 * Validated request for routes that do not accept a body (GET, DELETE).
 *
 * Omits `body` rather than using `never`, which would prevent passing a
 * {@link WireRouteRequest} through without casts.
 */
interface GetRouteRequest<TParams, TQuery> {
  params: TParams;
  query: TQuery;
  headers: Readonly<Record<string, string | undefined>>;
}

/** Handler for POST, PUT, and PATCH routes. */
type RouteHandler<TParams, TQuery, TBody, TResponse> = (
  request: RouteRequest<TParams, TQuery, TBody>,
  auth: RequestAuth | undefined,
) => Promise<DataErrorSignature<TResponse>>;

/** Handler for GET routes. */
type GetRouteHandler<TParams, TQuery, TResponse> = (
  request: GetRouteRequest<TParams, TQuery>,
  auth: RequestAuth | undefined,
) => Promise<DataErrorSignature<TResponse>>;

/** Handler for DELETE routes. */
type DeleteRouteHandler<TParams, TQuery> = (
  request: GetRouteRequest<TParams, TQuery>,
  auth: RequestAuth | undefined,
) => Promise<ErrorSignature | NoContentSignature>;

/** Handler for POST routes that return a raw media document on success. */
type MediaRouteHandler<
  TParams,
  TQuery,
  TBody,
  TSuccessContentType extends MediaContentType,
> = (
  request: RouteRequest<TParams, TQuery, TBody>,
  auth: RequestAuth | undefined,
) => Promise<DataErrorSignature<MediaPayload<TSuccessContentType>>>;

/** MIME type of a route's success response body. */
type SuccessContentType = MediaContentType | 'application/json';

/**
 * A route ready for registration with the HTTP adapter.
 *
 * Built by `implement*Route` from a prevail-contracts route definition.
 * `invoke` validates the wire request, runs the handler, and returns an
 * internal envelope that `registerRoutes` projects to the HTTP wire format.
 */
interface RegisteredRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  auth: RouteAuth;
  /** HTTP status code sent on success (200, 201, or 204). */
  successStatus: 200 | 201 | 204;
  /** MIME type of the success response body. */
  successContentType: SuccessContentType;
  invoke: (request: WireRouteRequest) => Promise<RouteInvokeResult>;
}

/** Collection of routes passed to `registerRoutes`. */
type RouteRegistry = readonly RegisteredRoute[];

export type {
  DeleteRouteHandler,
  GetRouteHandler,
  GetRouteRequest,
  MediaRouteHandler,
  RegisteredRoute,
  RequestAuth,
  RouteHandler,
  RouteRegistry,
  RouteRequest,
  SuccessContentType,
  WireRouteRequest,
};
