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

/**
 * Build a DELETE-style success with no body.
 *
 * @returns A {@link NoContentSignature} for HTTP 204 mapping.
 */
const noContentSuccess = (): NoContentSignature => ({ success: true });

/**
 * Build a success whose data is an empty object.
 *
 * Used where the contract expects `{}` rather than no body (for example some
 * POST acknowledgements).
 *
 * @returns A data success with `data: {}`.
 */
const emptyObjectSuccess = (): DataErrorSignature<Record<string, never>> => ({
  success: true,
  data: {},
});

/**
 * Map a void data success onto a no-content success for DELETE responses.
 *
 * Errors pass through unchanged.
 *
 * @param result - Void data/error envelope from a use case.
 * @returns No-content on success, or the original error.
 */
const mapVoidToNoContent = (
  result: DataErrorSignature<void>,
): ErrorSignature | NoContentSignature => {
  if (!result.success) {
    return result;
  }
  const noContent = noContentSuccess();
  return noContent;
};

/**
 * Map a void data success onto an empty-object data success.
 *
 * Errors pass through unchanged.
 *
 * @param result - Void data/error envelope from a use case.
 * @returns Empty-object success, or the original error.
 */
const mapVoidToEmptyObject = (
  result: DataErrorSignature<void>,
): DataErrorSignature<Record<string, never>> => {
  if (!result.success) {
    return result;
  }
  const emptyObject = emptyObjectSuccess();
  return emptyObject;
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
