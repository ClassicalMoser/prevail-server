interface DataSignature<T> {
  success: true;
  data: T;
}

interface ErrorSignature {
  success: false;
  message: string;
  status: number;
}

/** DELETE success — HTTP 204 with no body. Not part of {@link DataErrorSignature}. */
interface NoContentSignature {
  success: true;
}

type DataErrorSignature<T> = DataSignature<T> | ErrorSignature;

/** Internal result from any route's `invoke` method. */
type RouteInvokeResult = DataErrorSignature<unknown> | NoContentSignature;

const noContentSuccess = (): NoContentSignature => ({ success: true });

export type {
  DataSignature,
  DataErrorSignature,
  ErrorSignature,
  NoContentSignature,
  RouteInvokeResult,
};
export { noContentSuccess };
