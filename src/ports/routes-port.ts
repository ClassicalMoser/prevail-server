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

export type { RouteDefinition, RouteRequest, RouteReply };
