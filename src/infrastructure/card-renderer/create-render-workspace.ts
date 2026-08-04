import { mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

interface RenderWorkspace {
  workspaceDir: string;
  cleanup: () => Promise<void>;
}

const linkAsset = async (
  assetsDir: string,
  workspaceDir: string,
  name: string,
): Promise<void> => {
  await symlink(
    path.join(assetsDir, name),
    path.join(workspaceDir, name),
    process.platform === 'win32' ? 'junction' : undefined,
  );
};

/**
 * Creates an isolated Typst project root for one render.
 *
 * Static assets are symlinked from {@link getCardRendererAssetsDir}; runtime
 * JSON and artwork are written directly into `workspaceDir`. Typst `--root`
 * must point at this directory so relative paths in the templates resolve.
 */
const createRenderWorkspace = async (
  assetsDir: string,
): Promise<RenderWorkspace> => {
  const workspaceDir = await mkdtemp(
    path.join(tmpdir(), 'prevail-card-render-'),
  );

  await linkAsset(assetsDir, workspaceDir, 'templates');
  await linkAsset(assetsDir, workspaceDir, 'icons');
  await linkAsset(assetsDir, workspaceDir, 'Cinzel-Regular.ttf');

  return {
    workspaceDir,
    cleanup: async () => {
      await rm(workspaceDir, { recursive: true, force: true });
    },
  };
};

export type { RenderWorkspace };
export { createRenderWorkspace };
