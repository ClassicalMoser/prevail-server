import { PutObjectCommand } from '@aws-sdk/client-s3';
import type { AssetType, UploadResult } from '@ports';
import { contentTypeFor } from './content-type-for';
import { r2 } from './r2-client';

const isPreconditionFailed = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  '$metadata' in error &&
  (error as { $metadata?: { httpStatusCode?: number } }).$metadata
    ?.httpStatusCode === 412;

const putImmutable = async (
  key: string,
  body: Buffer,
  assetType: AssetType,
): Promise<UploadResult> => {
  try {
    await r2.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: body,
        ContentType: contentTypeFor(assetType),
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

export { putImmutable };
