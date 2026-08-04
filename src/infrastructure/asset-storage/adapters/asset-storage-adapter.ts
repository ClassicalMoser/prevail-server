import type { S3Client } from '@aws-sdk/client-s3';
import type { AssetStorage, UploadResult } from '@ports';
import { objectExists } from '../object-exists';
import { putImmutable } from '../put-immutable';

interface AssetStorageConfig {
  bucket: string;
  client: S3Client;
}

const createAssetStorage = (config: AssetStorageConfig): AssetStorage => ({
  putImmutable: async (key, body, assetType): Promise<UploadResult> =>
    await putImmutable({
      client: config.client,
      bucket: config.bucket,
      key,
      body,
      assetType,
    }),
  objectExists: async (key): Promise<boolean> =>
    await objectExists(config.client, config.bucket, key),
});

export type { AssetStorageConfig };
export { createAssetStorage };
