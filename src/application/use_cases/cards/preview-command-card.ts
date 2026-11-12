import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature, PrintCommandCard } from '@ports';
import {
  buildUnitIdToNameMap,
  getCommandCardUnitIds,
  replaceCommandCardUnitIdsWithNames,
} from '@application/composable';
import type { CommandCardUseCasesDeps } from './command-card-use-cases-deps';

/**
 * Draw a command card as an SVG for an author to see, without storing it.
 *
 * An author previews a card while editing, before there is a version to
 * publish. The card's unit ids become names, as they would on the printed card.
 *
 * @param deps - Unit-card storage for names, and the renderer.
 * @param card - The command card being edited.
 * @returns The SVG text, or the first failure.
 */
const previewCommandCard = async (
  deps: CommandCardUseCasesDeps,
  card: CommandCard,
): Promise<DataErrorSignature<string>> => {
  // The card stores unit ids; the printed card shows unit names.
  const nameMapResult = await buildUnitIdToNameMap(
    deps.unitCardStorage,
    getCommandCardUnitIds(card),
  );
  if (!nameMapResult.success) {
    return nameMapResult;
  }
  const cardWithNames: PrintCommandCard = replaceCommandCardUnitIdsWithNames(
    card,
    nameMapResult.data,
  );

  // SVG only: no bleed, no unit image. This is a screen preview, not a print file.
  const renderResult = await deps.commandCardRenderer.renderCommandCard(
    cardWithNames,
    { bleed: false, format: 'svg', unitImage: false },
  );
  if (!renderResult.success) {
    return renderResult;
  }

  const previewed: DataErrorSignature<string> = {
    success: true,
    data: renderResult.data.toString('utf8'),
  };
  return previewed;
};

export { previewCommandCard };
