/**
 * Read an AWS SDK error's HTTP status without assuming the error class.
 *
 * S3 clients throw objects that carry `$metadata.httpStatusCode`. A missing
 * field is not a status, so callers treat `undefined` as "some other failure".
 *
 * @param error - Whatever the SDK threw.
 * @returns The HTTP status, when the object actually has one.
 */
const httpStatusCode = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }
  if (!('$metadata' in error)) {
    return undefined;
  }
  const metadata = error.$metadata;
  if (typeof metadata !== 'object' || metadata === null) {
    return undefined;
  }
  if (!('httpStatusCode' in metadata)) {
    return undefined;
  }
  const status = metadata.httpStatusCode;
  if (typeof status !== 'number') {
    return undefined;
  }
  return status;
};

export { httpStatusCode };
