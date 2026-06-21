import type {
  DataSignature,
  ErrorSignature,
  RouteInvokeResult,
} from '@ports';

const isErrorSignature = (
  value: RouteInvokeResult,
): value is ErrorSignature => value.success === false;

const isDataSignature = (
  value: RouteInvokeResult,
): value is DataSignature<unknown> =>
  value.success === true && 'data' in value;

export { isDataSignature, isErrorSignature };
