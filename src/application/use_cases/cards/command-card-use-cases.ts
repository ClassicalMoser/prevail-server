import { cardSchema } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  CertificationResults,
  CommandCardRendererPort,
  CommandCardStorage,
  CommandCardUseCasesPort,
  DataErrorSignature,
  ErrorSignature,
  NoContentSignature,
  PrintCommandCard,
  UnitCardStorage,
} from '@ports';
import { noContentSuccess } from '@ports';
import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { Card } from '@classicalmoser/prevail-rules/domain';
import {
  allCommandCardAssetsExist,
  buildUnitIdToNameMap,
  ensureCommandCardProjection,
  getCommandCardUnitIds,
  projectCommandCardVersion,
  replaceCommandCardUnitIdsWithNames,
} from '@application/composable';

interface CommandCardUseCasesDeps {
  commandCardStorage: CommandCardStorage;
  unitCardStorage: UnitCardStorage;
  commandCardRenderer: CommandCardRendererPort;
  assetStorage: AssetStorage;
}

const createCommandCardUseCases = (
  deps: CommandCardUseCasesDeps,
): CommandCardUseCasesPort => ({
  getCurrentCommandCards: async (): Promise<DataErrorSignature<Card[]>> =>
    deps.commandCardStorage.getCurrentCommandCards(),
  getAllCommandCards: async (): Promise<DataErrorSignature<CardListItem[]>> =>
    deps.commandCardStorage.getAllCommandCards(),
  getCommandCardById: async (id: string): Promise<DataErrorSignature<Card>> =>
    deps.commandCardStorage.getCommandCardById(id),
  getCommandCardsByIds: async (
    ids: string[],
  ): Promise<DataErrorSignature<Card[]>> =>
    deps.commandCardStorage.getCommandCardsByIds(ids),
  createEmptyCommandCard: async (): Promise<DataErrorSignature<string>> =>
    deps.commandCardStorage.createEmptyCommandCard(),
  createCommandCardVersion: async (
    card: Card,
  ): Promise<DataErrorSignature<Card>> => {
    const insertResult =
      await deps.commandCardStorage.createCommandCardVersion(card);
    if (!insertResult.success) {
      return insertResult;
    }

    const unitIds = getCommandCardUnitIds(insertResult.data);
    const nameMapResult = await buildUnitIdToNameMap(
      deps.unitCardStorage,
      unitIds,
    );
    if (!nameMapResult.success) {
      await deps.commandCardStorage.deleteCommandCardVersion(insertResult.data);
      return nameMapResult;
    }

    const projectResult = await projectCommandCardVersion(
      {
        assetStorage: deps.assetStorage,
        commandCardRenderer: deps.commandCardRenderer,
        unitIdToNameMap: nameMapResult.data,
      },
      { ...card, ...insertResult.data },
    );
    if (!projectResult.success) {
      await deps.commandCardStorage.deleteCommandCardVersion(insertResult.data);
      return projectResult;
    }

    return insertResult;
  },
  deleteEmptyCommandCards: async (): Promise<
    ErrorSignature | NoContentSignature
  > => {
    const result = await deps.commandCardStorage.deleteEmptyCommandCards();
    if (!result.success) {
      return result;
    }

    return noContentSuccess();
  },
  updateCommandCardCertifications: async (): Promise<
    DataErrorSignature<CertificationResults>
  > => {
    const beforeResult =
      await deps.commandCardStorage.getLatestCommandCardCertifications();
    if (!beforeResult.success) {
      return beforeResult;
    }

    const uncertifiedStatuses = beforeResult.data.filter(
      ({ certified }) => !certified,
    );

    const schemaValidStatuses = uncertifiedStatuses.filter(
      ({ card }) => cardSchema.safeParse(card).success,
    );

    const allUnitIds = [
      ...new Set(
        schemaValidStatuses.flatMap(({ card }) => getCommandCardUnitIds(card)),
      ),
    ];
    const nameMapResult = await buildUnitIdToNameMap(
      deps.unitCardStorage,
      allUnitIds,
    );
    if (!nameMapResult.success) {
      return nameMapResult;
    }

    const projectionDeps = {
      assetStorage: deps.assetStorage,
      commandCardRenderer: deps.commandCardRenderer,
      unitIdToNameMap: nameMapResult.data,
    };

    const statusesMissingAssets = [];
    for (const entry of schemaValidStatuses) {
      if (!(await allCommandCardAssetsExist(deps.assetStorage, entry.card))) {
        statusesMissingAssets.push(entry);
      }
    }

    for (const { card } of statusesMissingAssets) {
      const healResult = await ensureCommandCardProjection(
        projectionDeps,
        card,
      );
      if (!healResult.success) {
        return healResult;
      }
    }

    const readyToCertify: string[] = [];
    for (const { card } of schemaValidStatuses) {
      if (await allCommandCardAssetsExist(deps.assetStorage, card)) {
        readyToCertify.push(card.id);
      }
    }

    const certifyResult =
      await deps.commandCardStorage.certifyCommandCardVersions(readyToCertify);
    if (!certifyResult.success) {
      return certifyResult;
    }

    const afterResult =
      await deps.commandCardStorage.getLatestCommandCardCertifications();
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
    const nameMapResult = await buildUnitIdToNameMap(
      deps.unitCardStorage,
      unitIds,
    );
    if (!nameMapResult.success) {
      return nameMapResult;
    }

    const cardWithNames: PrintCommandCard = replaceCommandCardUnitIdsWithNames(
      card,
      nameMapResult.data,
    );
    const renderResult = await deps.commandCardRenderer.renderCommandCard(
      cardWithNames,
      { bleed: false, format: 'svg', unitImage: false },
    );
    if (!renderResult.success) {
      return renderResult;
    }

    return {
      success: true,
      data: renderResult.data.toString('utf8'),
    };
  },
});

export type { CommandCardUseCasesDeps };
export { createCommandCardUseCases };
