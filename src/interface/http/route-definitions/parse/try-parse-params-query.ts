import type { GetRouteValidators } from '@classicalmoser/prevail-contracts';
import type { WireRouteRequest } from '@ports';
import type { ParseResult } from './parse-result';
import { invalidParams, invalidQuery } from './parse-result';

type ParamsQueryValidators<
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
> = Pick<GetRouteValidators<TParams, TQuery, unknown>, 'params' | 'query'>;

/**
 * Validate path params and query against contract Zod schemas.
 *
 * @param wire - Raw Fastify request fields.
 * @param validators - Params and query schemas from the contract.
 * @returns Parsed params/query, or a 400 error for the failing part.
 */
const tryParseParamsQuery = <
  TParams extends Record<string, unknown>,
  TQuery extends Record<string, unknown>,
>(
  wire: WireRouteRequest,
  validators: ParamsQueryValidators<TParams, TQuery>,
): ParseResult<{ params: TParams; query: TQuery }> => {
  const paramsResult = validators.params.safeParse(wire.params ?? {});
  if (!paramsResult.success) {
    return { ok: false, error: invalidParams };
  }

  const queryResult = validators.query.safeParse(wire.query ?? {});
  if (!queryResult.success) {
    return { ok: false, error: invalidQuery };
  }

  return {
    ok: true,
    value: {
      params: paramsResult.data,
      query: queryResult.data,
    },
  };
};

export type { ParamsQueryValidators };
export { tryParseParamsQuery };
