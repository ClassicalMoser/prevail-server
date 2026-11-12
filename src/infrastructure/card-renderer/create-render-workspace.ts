import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

/** A temp Typst project root for one render, and the call that removes it. */
interface RenderWorkspace {
  /** Typst `--root` for this render; holds the copied assets and the input JSON. */
  workspaceDir: string;
  /** Deletes `workspaceDir`; the renderer calls it whether or not the compile worked. */
  cleanup: () => Promise<void>;
}

const copyAsset = async (
  assetsDir: string,
  workspaceDir: string,
  name: string,
): Promise<void> => {
  await cp(path.join(assetsDir, name), path.join(workspaceDir, name), {
    recursive: true,
  });
};

/**
 * Creates an isolated Typst project root for one render.
 *
 * Static assets are copied from the configured assets dir (not symlinked —
 * Typst resolves symlinks and rejects sources outside `--root`). Runtime
 * JSON and artwork are written directly into `workspaceDir`. Typst `--root`
 * must point at this directory so relative paths in the templates resolve.
 */
const createRenderWorkspace = async (
  assetsDir: string,
): Promise<RenderWorkspace> => {
  // A fresh directory per render, so two authors previewing at once cannot
  // overwrite each other's card data or artwork.
  const workspaceDir = await mkdtemp(
    path.join(tmpdir(), 'prevail-card-render-'),
  );

  // The card layouts, icons and font are everything a template may reference.
  await copyAsset(assetsDir, workspaceDir, 'templates');
  await copyAsset(assetsDir, workspaceDir, 'icons');
  await copyAsset(assetsDir, workspaceDir, 'Cinzel-Regular.ttf');

  return {
    workspaceDir,
    cleanup: async () => {
      await rm(workspaceDir, { recursive: true, force: true });
    },
  };
};

export type { RenderWorkspace };
export { createRenderWorkspace };
