import type {
  DeleteRouteValidators,
  GetRouteValidators,
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
    | PatchRouteValidators<TParams, TQuery, TBody, TReturn>,
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
