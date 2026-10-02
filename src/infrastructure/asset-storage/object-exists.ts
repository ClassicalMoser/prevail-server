import type { S3Client } from '@aws-sdk/client-s3';
import { HeadObjectCommand, NotFound } from '@aws-sdk/client-s3';

import { httpStatusCode } from './http-status-code';

/**
 * Whether an S3/R2 error means the object is absent.
 *
 * @param error - Thrown value from a HeadObject (or similar) call.
 * @returns True for NotFound or HTTP 404 status.
 */
const isNotFound = (error: unknown): boolean => {
  if (error instanceof NotFound) {
    return true;
  }
  const status = httpStatusCode(error);
  return status === 404;
};

/**
 * Probe whether an object key already exists in the bucket.
 *
 * A 404 becomes false. Any other error is rethrown so callers can fail the
 * projection rather than treating an outage as "missing".
 *
 * @param client - R2/S3 client.
 * @param bucket - Bucket name.
 * @param key - Object key to head.
 * @returns True when HeadObject succeeds.
 */
const objectExists = async (
  client: S3Client,
  bucket: string,
  key: string,
): Promise<boolean> => {
  try {
    await client.send(
      new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      }),
    );
    return true;
  } catch (error: unknown) {
    if (isNotFound(error)) {
      return false;
    }

    throw error;
  }
};

export { objectExists };
