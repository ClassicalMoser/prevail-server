/** svg for on-screen previews, pdf for print. */
type RenderFormat = 'svg' | 'pdf';

/** How a card is drawn: output format, and whether the print file carries bleed. */
interface RenderDetails {
  bleed: boolean;
  format: RenderFormat;
  /** When true, Typst loads local unit artwork instead of the placeholder. */
  unitImage: boolean;
}

export type { RenderDetails, RenderFormat };
