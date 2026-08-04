import type { AssetType, RenderDetails } from '@ports';

const renderDetailsForAssetType = (assetType: AssetType): RenderDetails => {
  switch (assetType) {
    case 'svg': {
      return { bleed: false, format: 'svg', unitImage: false };
    }
    case 'pdf': {
      return { bleed: false, format: 'pdf', unitImage: false };
    }
    case 'pdf-bleed': {
      return { bleed: true, format: 'pdf', unitImage: false };
    }
    default: {
      const _exhaustive: never = assetType;
      return _exhaustive;
    }
  }
};

export { renderDetailsForAssetType };
