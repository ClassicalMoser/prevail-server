import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

interface RenderWorkspace {
  workspaceDir: string;
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
  const workspaceDir = await mkdtemp(
    path.join(tmpdir(), 'prevail-card-render-'),
  );

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
