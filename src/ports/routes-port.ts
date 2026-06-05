import type { DataErrorSignature } from './';

interface RouteRequest<TParams = unknown, TBody = unknown, TQuery = unknown> {
  params: TParams;
  body: TBody;
  query: TQuery;
}

interface RouteReply<TResponse> {
  send: (payload: TResponse) => void;
  status: (code: number) => RouteReply<TResponse>;
}

interface RouteDefinition<
  TParams = unknown,
  TBody = unknown,
  TQuery = unknown,
  TResponse = DataErrorSignature<unknown>,
> {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  handler: (
    request: RouteRequest<TParams, TBody, TQuery>,
    reply: RouteReply<TResponse>,
  ) => Promise<TResponse>;
}

// Handlers are contravariant in `request`. Erasing generics here lets each route keep typed params/query/response at its definition site via `satisfies`.
// oxlint-disable-next-line typescript/no-explicit-any -- heterogeneous route registry
type RouteRegistry = readonly RouteDefinition<any, any, any, any>[];

export type { RouteDefinition, RouteRegistry, RouteRequest, RouteReply };
