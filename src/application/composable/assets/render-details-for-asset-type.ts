import type { AssetType, RenderDetails } from '@ports';

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
