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
  if (configured !== undefined && configured.length > 0) {
    return path.resolve(configured);
  }
  return path.join(cwd, 'card-renderer');
};

export { resolveCardRendererAssetsDir };
