type RenderFormat = 'svg' | 'pdf';

interface RenderDetails {
  bleed: boolean;
  format: RenderFormat;
  /** When true, Typst loads local unit artwork instead of the placeholder. */
  unitImage: boolean;
}

export type { RenderDetails, RenderFormat };
