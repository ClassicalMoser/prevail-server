import type { ErrorSignature } from '@ports';

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

export type { ParseResult };
export { invalidBody, invalidParams, invalidQuery };
