import type {
  DeleteRouteValidators,
  GetRouteValidators,
  MediaPostRouteValidators,
  PatchRouteValidators,
  PostRouteValidators,
  PutRouteValidators,
} from '@classicalmoser/prevail-contracts';
import type {
  ErrorSignature,
  GetRouteRequest,
  RouteRequest,
  WireRouteRequest,
} from '@ports';

type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: ErrorSignature };

/**
 * Shared 400 bodies for a contract Zod failure.
 *
 * Params, query, and body stay distinct so the handler can report which part
 * of the request failed without inspecting the Zod issue list.
 */
const invalidParams: ErrorSignature = {
  success: false,
  message: 'Invalid params',
  status: 400,
};

const invalidQuery: ErrorSignature = {
  success: false,
  message: 'Invalid query',
  status: 400,
};

const invalidBody: ErrorSignature = {
  success: false,
  message: 'Invalid body',
  status: 400,
};

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
  const paramsResult = validators.params.safeParse(wire.params ?? {});
  if (!paramsResult.success) {
    return { ok: false, error: invalidParams };
  }

  const queryResult = validators.query.safeParse(wire.query ?? {});
  if (!queryResult.success) {
    return { ok: false, error: invalidQuery };
  }

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

export { tryParseBodyRouteRequest, tryParseDeleteRequest, tryParseGetRequest };
export type { ParseResult };
