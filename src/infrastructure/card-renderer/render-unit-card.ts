import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { DataErrorSignature, RenderDetails } from '@ports';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { UnitCardRendererDeps } from './card-renderer-deps';
import { createRenderWorkspace } from './create-render-workspace';
import { fetchUnitArtwork } from './fetch-unit-artwork';
import { runTypstCompile, templatePathInWorkspace } from './run-typst-compile';

const toRenderErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return 'Failed to render unit card';
  }

  if ('stderr' in error && typeof error.stderr === 'string') {
    const stderr = error.stderr.trim();
    if (stderr.length > 0) {
      return stderr;
    }
  }

  return error.message;
};

const resolveUnitImage = async (
  workspaceDir: string,
  imageUrl: string | null,
  allowedMediaOrigin: string,
): Promise<DataErrorSignature<boolean>> => {
  if (imageUrl === null) {
    return { success: true, data: false };
  }

  return fetchUnitArtwork(
    imageUrl,
    path.join(workspaceDir, 'unit-image.png'),
    allowedMediaOrigin,
  );
};

/**
 * Render one unit card to a buffer through a temporary Typst workspace.
 *
 * The workspace gets a copy of the templates and, when the details ask for
 * it, the unit artwork downloaded from an allowed origin. Compile writes to
 * stdout. The workspace is removed after the compile, success or failure.
 *
 * @param unitType - Domain unit type, including artwork URL and stats.
 * @param details - Format, bleed, and whether to embed the unit image.
 * @param deps - Assets directory and the allowed media origin.
 * @returns The compiled bytes, or an error envelope when compile fails.
 */
const renderUnitCard = async (
  unitType: UnitType,
  details: RenderDetails,
  deps: UnitCardRendererDeps,
): Promise<DataErrorSignature<Buffer>> => {
  const workspace = await createRenderWorkspace(deps.assetsDir);

  try {
    const { workspaceDir } = workspace;

    const unitImageResult = await resolveUnitImage(
      workspaceDir,
      unitType.imageUrl,
      deps.allowedMediaOrigin,
    );
    if (!unitImageResult.success) {
      return unitImageResult;
    }

    const renderDetails: RenderDetails = {
      ...details,
      unitImage: unitImageResult.data,
    };

    await writeFile(
      path.join(workspaceDir, 'unit-card-data.json'),
      JSON.stringify({ unitType }, undefined, 2),
    );
    await writeFile(
      path.join(workspaceDir, 'details.json'),
      JSON.stringify(renderDetails, undefined, 2),
    );

    const rendered = await runTypstCompile(
      workspaceDir,
      templatePathInWorkspace(workspaceDir, 'unit.typ'),
      renderDetails.format,
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

export { renderUnitCard };
