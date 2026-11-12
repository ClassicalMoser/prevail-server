import type { S3Client } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import type { AssetType, UploadResult } from '@ports';
import { contentTypeFor } from './content-type-for';
import { httpStatusCode } from './http-status-code';

/** Everything one conditional asset upload needs. */
interface PutImmutableParams {
  client: S3Client;
  bucket: string;
  /** Object key; versioned, so the same key always means the same bytes. */
  key: string;
  /** The rendered card file to store. */
  body: Buffer;
  /** Picks the Content-Type a browser or print tool sees on download. */
  assetType: AssetType;
}

/**
 * Whether an S3/R2 error is a precondition failure (object already there).
 *
 * @param error - Thrown value from PutObject with IfNoneMatch.
 * @returns True for HTTP 412.
 */
const isPreconditionFailed = (error: unknown): boolean => {
  const status = httpStatusCode(error);
  return status === 412;
};

/**
 * Write an object only if the key does not already exist.
 *
 * Uses `IfNoneMatch: *` so concurrent projectors do not overwrite a versioned
 * asset. A 412 is reported as `already-exists` rather than thrown.
 *
 * @param params - Client, bucket, key, bytes, and asset type for Content-Type.
 * @returns `written` on create, or `already-exists` when the key was present.
 */
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
        // Conditional write: assets are content-addressed and immutable, so a
        // second writer must not replace what browsers have cached for a year.
        IfNoneMatch: '*',
      }),
    );
    return { kind: 'written' };
  } catch (error: unknown) {
    // Already stored by an earlier or concurrent projection: success, not failure.
    if (isPreconditionFailed(error)) {
      return { kind: 'already-exists' };
    }

    throw error;
  }
};

export type { PutImmutableParams };
export { putImmutable };
