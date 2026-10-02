import type { AssetType, RenderDetails } from '@ports';

/**
 * Map a stored asset type onto the Typst render details for that file.
 *
 * Bleed is only on for `pdf-bleed`. Unit artwork embedding stays off here;
 * callers that need a portrait set `unitImage` on the details they pass.
 *
 * @param assetType - Target format in object storage.
 * @returns Details the card renderer sends into Typst.
 */
const renderDetailsForAssetType = (assetType: AssetType): RenderDetails => {
  switch (assetType) {
    case 'svg': {
      const details: RenderDetails = {
        bleed: false,
        format: 'svg',
        unitImage: false,
      };
      return details;
    }
    case 'pdf': {
      const details: RenderDetails = {
        bleed: false,
        format: 'pdf',
        unitImage: false,
      };
      return details;
    }
    case 'pdf-bleed': {
      const details: RenderDetails = {
        bleed: true,
        format: 'pdf',
        unitImage: false,
      };
      return details;
    }
    default: {
      const _exhaustive: never = assetType;
      return _exhaustive;
    }
  }
};

export { renderDetailsForAssetType };
