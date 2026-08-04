type AssetType = 'svg' | 'pdf' | 'pdf-bleed';

type UploadResult = { kind: 'written' } | { kind: 'already-exists' };

interface AssetStorage {
  putImmutable: (
    key: string,
    body: Buffer,
    assetType: AssetType,
  ) => Promise<UploadResult>;
  objectExists: (key: string) => Promise<boolean>;
}

export type { AssetStorage, AssetType, UploadResult };
