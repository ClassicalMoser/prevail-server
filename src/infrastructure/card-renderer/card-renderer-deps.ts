/** Where the command-card renderer finds Typst templates, icons and fonts. */
interface CommandCardRendererDeps {
  assetsDir: string;
}

/** Typst assets location plus the only origin unit artwork may be fetched from. */
interface UnitCardRendererDeps {
  allowedMediaOrigin: string;
  assetsDir: string;
}

export type { CommandCardRendererDeps, UnitCardRendererDeps };
