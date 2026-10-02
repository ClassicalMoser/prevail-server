import type { GetRouteValidators } from '@classicalmoser/prevail-contracts';
import type { GetRouteRequest, WireRouteRequest } from '@ports';
import type { ParseResult } from './parse-result';
import { tryParseParamsQuery } from './try-parse-params-query';

/**
 * Parse a GET wire request into typed params, query, and headers.
 *
 * @param wire - Raw Fastify request fields.
 * @param validators - GET contract validators.
 * @returns Parsed GET request, or a 400 error envelope.
 */
const tryParseGetRequest = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
  TReturn,
>(
  wire: WireRouteRequest,
  validators: GetRouteValidators<TParams, TQuery, TReturn>,
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

export { tryParseGetRequest };
