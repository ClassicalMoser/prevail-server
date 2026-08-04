import type { AssetType } from '@ports';

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
