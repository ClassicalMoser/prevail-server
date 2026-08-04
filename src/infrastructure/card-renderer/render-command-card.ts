import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type {
  DataErrorSignature,
  PrintCommandCard,
  RenderDetails,
} from '@ports';
import type { CommandCardRendererDeps } from './card-renderer-deps';
import { createRenderWorkspace } from './create-render-workspace';
import { runTypstCompile, templatePathInWorkspace } from './run-typst-compile';

const toRenderErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return 'Failed to render command card';
  }

  if ('stderr' in error && typeof error.stderr === 'string') {
    const stderr = error.stderr.trim();
    if (stderr.length > 0) {
      return stderr;
    }
  }

  return error.message;
};

/**
 * Renders a command card via the Typst CLI.
 *
 * 1. Creates a per-request workspace under the OS temp dir
 * 2. Writes card payload and render details JSON into that workspace
 * 3. Runs `typst compile` with `--root` set to the workspace
 */
const renderCommandCard = async (
  card: PrintCommandCard,
  details: RenderDetails,
  deps: CommandCardRendererDeps,
): Promise<DataErrorSignature<Buffer>> => {
  const workspace = await createRenderWorkspace(deps.assetsDir);

  try {
    const { workspaceDir } = workspace;
    await writeFile(
      path.join(workspaceDir, 'command-card-data.json'),
      JSON.stringify({ card }, undefined, 2),
    );
    await writeFile(
      path.join(workspaceDir, 'details.json'),
      JSON.stringify(details, undefined, 2),
    );

    const rendered = await runTypstCompile(
      workspaceDir,
      templatePathInWorkspace(workspaceDir, 'command.typ'),
      details.format,
    );

    return { success: true, data: rendered };
  } catch (error) {
    return {
      success: false,
      message: toRenderErrorMessage(error),
      status: 500,
    };
  } finally {
    await workspace.cleanup();
  }
};

export { renderCommandCard };
