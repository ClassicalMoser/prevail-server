/** Where the command-card renderer finds Typst templates, icons and fonts. */
interface CommandCardRendererDeps {
  /** Directory holding `templates`, `icons` and the font, copied into each render workspace. */
  assetsDir: string;
}

/** Typst assets location plus the only origin unit artwork may be fetched from. */
interface UnitCardRendererDeps {
  /** Origin an author's artwork URL must match before the server fetches it. */
  allowedMediaOrigin: string;
  /** Directory holding `templates`, `icons` and the font, copied into each render workspace. */
  assetsDir: string;
}

export type { CommandCardRendererDeps, UnitCardRendererDeps };
