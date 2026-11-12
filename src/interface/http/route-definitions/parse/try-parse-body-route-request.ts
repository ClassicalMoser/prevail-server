import type {
  MediaPostRouteValidators,
  PatchRouteValidators,
  PostRouteValidators,
  PutRouteValidators,
} from '@classicalmoser/prevail-contracts';
import type { RouteRequest, WireRouteRequest } from '@ports';
import type { ParseResult } from './parse-result';
import { invalidBody, invalidParams, invalidQuery } from './parse-result';

/**
 * Parse a body-bearing wire request (POST/PUT/PATCH/media) into typed fields.
 *
 * @param wire - Raw Fastify request fields.
 * @param validators - Contract validators including body.
 * @returns Parsed route request, or a 400 error for params, query, or body.
 */
const tryParseBodyRouteRequest = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TBody,
  TReturn,
>(
  wire: WireRouteRequest,
  validators:
    | PostRouteValidators<TParams, TQuery, TBody, TReturn>
    | PutRouteValidators<TParams, TQuery, TBody, TReturn>
    | PatchRouteValidators<TParams, TQuery, TBody, TReturn>
    | MediaPostRouteValidators<TParams, TQuery, TBody>,
): ParseResult<RouteRequest<TParams, TQuery, TBody>> => {
  // Params, then query, then body: the 400 names the first part at fault. A
  // missing params or query is parsed as {} so an all-optional schema accepts a bare request.
  const paramsResult = validators.params.safeParse(wire.params ?? {});
  if (!paramsResult.success) {
    return { ok: false, error: invalidParams };
  }

  const queryResult = validators.query.safeParse(wire.query ?? {});
  if (!queryResult.success) {
    return { ok: false, error: invalidQuery };
  }

  // The body is parsed as received: an absent body reaches the schema as
  // undefined, and is refused unless the contract allows it.
  const bodyResult = validators.body.safeParse(wire.body);
  if (!bodyResult.success) {
    return { ok: false, error: invalidBody };
  }

  return {
    ok: true,
    value: {
      params: paramsResult.data,
      query: queryResult.data,
      body: bodyResult.data,
      headers: wire.headers,
    },
  };
};

export { tryParseBodyRouteRequest };
