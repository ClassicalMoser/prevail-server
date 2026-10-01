import type { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import type { AssetType, UploadResult } from '@ports';
import { contentTypeFor } from './content-type-for';
import { httpStatusCode } from './http-status-code';

interface PutImmutableParams {
  client: S3Client;
  bucket: string;
  key: string;
  body: Buffer;
  assetType: AssetType;
}

const isPreconditionFailed = (error: unknown): boolean => {
  const status = httpStatusCode(error);
  return status === 412;
};

const putImmutable = async (
  params: PutImmutableParams,
): Promise<UploadResult> => {
  try {
    await params.client.send(
      new PutObjectCommand({
        Bucket: params.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: contentTypeFor(params.assetType),
        CacheControl: 'public, max-age=31536000, immutable',
        IfNoneMatch: '*',
      }),
    );
    return { kind: 'written' };
  } catch (error: unknown) {
    if (isPreconditionFailed(error)) {
      return { kind: 'already-exists' };
    }

    throw error;
  }
};

export type { PutImmutableParams };
export { putImmutable };
