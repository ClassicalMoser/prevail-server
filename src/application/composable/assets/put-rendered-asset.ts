import type { AssetStorage, DataErrorSignature } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';

/**
 * Turn a failed asset upload into a storage error envelope.
 *
 * The message is the thrown error's message when there is one, so a renderer
 * or S3 failure stays visible to the use case that asked for the projection.
 */
const toUploadError = (error: unknown): DataErrorSignature<void> => ({
  success: false,
  message: error instanceof Error ? error.message : 'Failed to upload asset',
  status: 500,
});

/**
 * Render one card asset and store it under the target key.
 *
 * A render failure is returned as-is. A thrown upload becomes an error
 * envelope so the caller can stop the rest of the projection.
 *
 * @param assetStorage - Immutable object store for card assets.
 * @param target - Key and type for the object being written.
 * @param renderResult - Bytes from the renderer, or a prior render failure.
 * @returns Success when the object is stored, or an error envelope.
 */
const putRenderedAsset = async (
  assetStorage: AssetStorage,
  target: CardAssetTarget,
  renderResult: DataErrorSignature<Buffer>,
): Promise<DataErrorSignature<void>> => {
  if (!renderResult.success) {
    return renderResult;
  }

  try {
    await assetStorage.putImmutable(target.key, renderResult.data, target.type);
    return { success: true, data: undefined };
  } catch (error: unknown) {
    const uploadError = toUploadError(error);
    return uploadError;
  }
};

export { putRenderedAsset };
