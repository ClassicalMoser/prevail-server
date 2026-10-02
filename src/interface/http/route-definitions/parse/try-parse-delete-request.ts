import type { DeleteRouteValidators } from '@classicalmoser/prevail-contracts';
import type { GetRouteRequest, WireRouteRequest } from '@ports';
import type { ParseResult } from './parse-result';
import { tryParseParamsQuery } from './try-parse-params-query';

/**
 * Parse a DELETE wire request into typed params, query, and headers.
 *
 * @param wire - Raw Fastify request fields.
 * @param validators - DELETE contract validators.
 * @returns Parsed request shaped like GET (no body), or a 400 error.
 */
const tryParseDeleteRequest = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
>(
  wire: WireRouteRequest,
  validators: DeleteRouteValidators<TParams, TQuery>,
): ParseResult<GetRouteRequest<TParams, TQuery>> => {
  const parsed = tryParseParamsQuery(wire, validators);
  if (!parsed.ok) {
    return parsed;
  }

  return {
    ok: true,
    value: {
      ...parsed.value,
      headers: wire.headers,
    },
  };
};

export { tryParseDeleteRequest };
