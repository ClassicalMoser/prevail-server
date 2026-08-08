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

const emptyObjectSuccess = (): DataErrorSignature<Record<string, never>> => ({
  success: true,
  data: {},
});

const mapVoidToNoContent = (
  result: DataErrorSignature<void>,
): ErrorSignature | NoContentSignature => {
  if (!result.success) {
    return result;
  }
  return noContentSuccess();
};

const mapVoidToEmptyObject = (
  result: DataErrorSignature<void>,
): DataErrorSignature<Record<string, never>> => {
  if (!result.success) {
    return result;
  }
  return emptyObjectSuccess();
};

export type {
  DataSignature,
  DataErrorSignature,
  ErrorSignature,
  NoContentSignature,
  RouteInvokeResult,
};
export {
  emptyObjectSuccess,
  mapVoidToEmptyObject,
  mapVoidToNoContent,
  noContentSuccess,
};
