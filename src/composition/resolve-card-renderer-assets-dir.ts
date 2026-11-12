import path from 'node:path';

/**
 * Find the directory the Typst card renderer reads its fonts and templates from.
 *
 * @param configured - The `CARD_RENDERER_ASSETS_DIR` value, if set.
 * @param cwd - Where the server was started.
 * @returns The configured directory made absolute, or `card-renderer` under `cwd`.
 */
const resolveCardRendererAssetsDir = (
  configured: string | undefined,
  cwd: string,
): string => {
  // An explicit setting wins; it is made absolute so the renderer finds it from
  // any working directory.
  if (configured !== undefined && configured.length > 0) {
    const absolute = path.resolve(configured);
    return absolute;
  }
  // Unset: look for card-renderer beside where the server was started.
  const fallback = path.join(cwd, 'card-renderer');
  return fallback;
};

export { resolveCardRendererAssetsDir };
