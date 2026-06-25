type AssetType = 'svg' | 'pdf' | 'pdf-bleed';

type UploadResult = { kind: 'written' } | { kind: 'already-exists' };

interface AssetStorage {
  putImmutable: (
    key: string,
    body: Buffer,
    assetType: AssetType,
  ) => Promise<UploadResult>;
}

export type { AssetStorage, AssetType, UploadResult };
