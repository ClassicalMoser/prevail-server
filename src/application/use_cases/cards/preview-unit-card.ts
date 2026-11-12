import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import type { UnitCardUseCasesDeps } from './unit-card-use-cases-deps';

/**
 * Draw a unit card as an SVG for an author to see, without storing it.
 *
 * An author previews a card while editing, before there is a version to
 * publish.
 *
 * @param deps - The renderer.
 * @param unitType - The unit being edited.
 * @returns The SVG text, or the render failure.
 */
const previewUnitCard = async (
  deps: UnitCardUseCasesDeps,
  unitType: UnitType,
): Promise<DataErrorSignature<string>> => {
  // SVG only: no bleed, no unit image. This is a screen preview, not a print file.
  const renderResult = await deps.unitCardRenderer.renderUnitCard(unitType, {
    bleed: false,
    format: 'svg',
    unitImage: false,
  });
  if (!renderResult.success) {
    return renderResult;
  }

  const previewed: DataErrorSignature<string> = {
    success: true,
    data: renderResult.data.toString('utf8'),
  };
  return previewed;
};

export { previewUnitCard };
