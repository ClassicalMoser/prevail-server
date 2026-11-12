/** The print file kinds stored: an SVG, a PDF, and a PDF with bleed for printers. */
type AssetType = 'svg' | 'pdf' | 'pdf-bleed';

/**
 * Immutable keys are written once: a second upload of the same key reports
 * already-exists rather than overwriting what a print may already reference.
 */
type UploadResult = { kind: 'written' } | { kind: 'already-exists' };

/** Object storage for generated card images and print files. */
interface AssetStorage {
  putImmutable: (
    key: string,
    body: Buffer,
    assetType: AssetType,
  ) => Promise<UploadResult>;
  objectExists: (key: string) => Promise<boolean>;
}

export type { AssetStorage, AssetType, UploadResult };
