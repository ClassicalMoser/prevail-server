import type { DataSignature, ErrorSignature, RouteInvokeResult } from '@ports';

/**
 * Narrow a route invoke result to the failure branch.
 *
 * @param value - Success, no-content, or error from a route `invoke`.
 * @returns True when `success` is false.
 */
const isErrorSignature = (value: RouteInvokeResult): value is ErrorSignature =>
  value.success === false;

/**
 * Narrow a route invoke result to a data-bearing success.
 *
 * No-content successes are excluded: they have `success: true` but no `data`.
 *
 * @param value - Success, no-content, or error from a route `invoke`.
 * @returns True when the result carries a `data` field.
 */
const isDataSignature = (
  value: RouteInvokeResult,
): value is DataSignature<unknown> => value.success === true && 'data' in value;

export { isDataSignature, isErrorSignature };
