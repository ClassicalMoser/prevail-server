import { cardSchema } from '@classicalmoser/prevail-rules/domain';
import type {
  CertificationResults,
  CommandCardRendererPort,
  CommandCardStorage,
  CommandCardUseCasesPort,
  DataErrorSignature,
  ErrorSignature,
  NoContentSignature,
  PrintCommandCard,
} from '@ports';
import { noContentSuccess } from '@ports';
import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { Card } from '@classicalmoser/prevail-rules/domain';
import {
  buildPlaceholderUnitIdToNameMap,
  getCommandCardUnitIds,
  replaceCommandCardUnitIdsWithNames,
} from '@application/composable';
import type { UnitIdToNameMap } from '@application/composable';

const createCommandCardUseCases = (
  commandCardStorage: CommandCardStorage,
  commandCardRenderer: CommandCardRendererPort,
): CommandCardUseCasesPort => ({
  getCurrentCommandCards: async (): Promise<DataErrorSignature<Card[]>> =>
    commandCardStorage.getCurrentCommandCards(),
  getAllCommandCards: async (): Promise<DataErrorSignature<CardListItem[]>> =>
    commandCardStorage.getAllCommandCards(),
  getCommandCardById: async (id: string): Promise<DataErrorSignature<Card>> =>
    commandCardStorage.getCommandCardById(id),
  getCommandCardsByIds: async (
    ids: string[],
  ): Promise<DataErrorSignature<Card[]>> =>
    commandCardStorage.getCommandCardsByIds(ids),
  createEmptyCommandCard: async (): Promise<DataErrorSignature<string>> =>
    commandCardStorage.createEmptyCommandCard(),
  createCommandCardVersion: async (
    card: Card,
  ): Promise<DataErrorSignature<Card>> =>
    commandCardStorage.createCommandCardVersion(card),
  deleteEmptyCommandCards: async (): Promise<
    ErrorSignature | NoContentSignature
  > => {
    const result = await commandCardStorage.deleteEmptyCommandCards();
    if (!result.success) {
      return result;
    }

    return noContentSuccess();
  },
  updateCommandCardCertifications: async (): Promise<
    DataErrorSignature<CertificationResults>
  > => {
    const beforeResult =
      await commandCardStorage.getLatestCommandCardCertifications();
    if (!beforeResult.success) {
      return beforeResult;
    }

    const validCommandCardIds = beforeResult.data
      .filter(({ card }) => cardSchema.safeParse(card).success)
      .map(({ card }) => card.id);

    const certifyResult =
      await commandCardStorage.certifyCommandCardVersions(validCommandCardIds);
    if (!certifyResult.success) {
      return certifyResult;
    }

    const afterResult =
      await commandCardStorage.getLatestCommandCardCertifications();
    if (!afterResult.success) {
      return afterResult;
    }

    const certified = afterResult.data
      .filter((status) => status.certified)
      .map(({ card }) => card.id);
    const uncertified = afterResult.data
      .filter((status) => !status.certified)
      .map(({ card }) => card.id);

    return {
      success: true,
      data: { certified, uncertified },
    };
  },
  previewCommandCard: async (
    card: Card,
  ): Promise<DataErrorSignature<string>> => {
    const unitIds: string[] = getCommandCardUnitIds(card);
    const placeholderUnitIdToNameMap: UnitIdToNameMap =
      buildPlaceholderUnitIdToNameMap(unitIds);
    const cardWithNames: PrintCommandCard = replaceCommandCardUnitIdsWithNames(
      card,
      placeholderUnitIdToNameMap,
    );
    return commandCardRenderer.renderCommandCard(cardWithNames, {
      bleed: false,
    });
  },
});

export { createCommandCardUseCases };
