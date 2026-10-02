import type { AssetType } from '@ports';

/**
 * Map a stored asset type to the Content-Type sent on upload.
 *
 * Bleed PDFs use the same MIME type as trim PDFs; the key path already
 * distinguishes them in the bucket.
 *
 * @param assetType - Catalog asset format being written.
 * @returns MIME type for the PutObject ContentType header.
 */
const contentTypeFor = (assetType: AssetType): string => {
  switch (assetType) {
    case 'svg': {
      return 'image/svg+xml';
    }
    case 'pdf':
    case 'pdf-bleed': {
      return 'application/pdf';
    }
    default: {
      const _exhaustive: never = assetType;
      return _exhaustive;
    }
  }
};

export { contentTypeFor };
