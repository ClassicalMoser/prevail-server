import type { S3Client } from '@aws-sdk/client-s3';
import { HeadObjectCommand, NotFound } from '@aws-sdk/client-s3';

import { httpStatusCode } from './http-status-code';

const isNotFound = (error: unknown): boolean => {
  if (error instanceof NotFound) {
    return true;
  }
  const status = httpStatusCode(error);
  return status === 404;
};

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
