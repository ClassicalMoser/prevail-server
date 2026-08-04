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
