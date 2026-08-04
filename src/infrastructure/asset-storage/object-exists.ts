import type { S3Client } from '@aws-sdk/client-s3';
import { HeadObjectCommand, NotFound } from '@aws-sdk/client-s3';

const isNotFound = (error: unknown): boolean => {
  if (error instanceof NotFound) {
    return true;
  }

  return (
    typeof error === 'object' &&
    error !== null &&
    '$metadata' in error &&
    (error as { $metadata?: { httpStatusCode?: number } }).$metadata
      ?.httpStatusCode === 404
  );
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
