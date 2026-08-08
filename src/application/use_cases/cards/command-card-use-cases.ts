import { commandCardSchema } from '@classicalmoser/prevail-rules/domain';
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
import { mapVoidToNoContent } from '@ports';
import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import {
  allCommandCardAssetsExist,
  buildUnitIdToNameMap,
  certifyCardVersions,
  ensureCommandCardProjection,
  getCommandCardUnitIds,
  projectCommandCardVersion,
  replaceCommandCardUnitIdsWithNames,
  toContractCardListItem,
} from '@application/composable';
import type { CommandCardProjectionDeps } from '@application/composable';

interface CommandCardUseCasesDeps {
  commandCardStorage: CommandCardStorage;
  unitCardStorage: UnitCardStorage;
  commandCardRenderer: CommandCardRendererPort;
  assetStorage: AssetStorage;
}

const createCommandCardUseCases = (
  deps: CommandCardUseCasesDeps,
): CommandCardUseCasesPort => ({
  getCurrentCommandCards: async (): Promise<
    DataErrorSignature<CommandCard[]>
  > => deps.commandCardStorage.getCurrentCommandCards(),
  getAllCommandCards: async (): Promise<DataErrorSignature<CardListItem[]>> => {
    const result = await deps.commandCardStorage.getAllCommandCards();
    if (!result.success) {
      return result;
    }
    return {
      success: true,
      data: result.data.map(toContractCardListItem),
    };
  },
  getCommandCardById: async (
    id: string,
  ): Promise<DataErrorSignature<CommandCard>> =>
    deps.commandCardStorage.getCommandCardById(id),
  getCommandCardsByIds: async (
    ids: string[],
  ): Promise<DataErrorSignature<CommandCard[]>> =>
    deps.commandCardStorage.getCommandCardsByIds(ids),
  createEmptyCommandCard: async (): Promise<DataErrorSignature<string>> =>
    deps.commandCardStorage.createEmptyCommandCard(),
  createCommandCardVersion: async (
    card: CommandCard,
  ): Promise<DataErrorSignature<CommandCard>> => {
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
  > =>
    mapVoidToNoContent(await deps.commandCardStorage.deleteEmptyCommandCards()),
  updateCommandCardCertifications: async (): Promise<
    DataErrorSignature<CertificationResults>
  > =>
    certifyCardVersions<CommandCard, CommandCardProjectionDeps>({
      getLatest: () =>
        deps.commandCardStorage.getLatestCommandCardCertifications(),
      isSchemaValid: (card) => commandCardSchema.safeParse(card).success,
      prepare: async (schemaValidStatuses) => {
        const allUnitIds = [
          ...new Set(
            schemaValidStatuses.flatMap(({ card }) =>
              getCommandCardUnitIds(card),
            ),
          ),
        ];
        const nameMapResult = await buildUnitIdToNameMap(
          deps.unitCardStorage,
          allUnitIds,
        );
        if (!nameMapResult.success) {
          return nameMapResult;
        }
        return {
          success: true,
          data: {
            assetStorage: deps.assetStorage,
            commandCardRenderer: deps.commandCardRenderer,
            unitIdToNameMap: nameMapResult.data,
          },
        };
      },
      allAssetsExist: async (card) =>
        allCommandCardAssetsExist(deps.assetStorage, card),
      ensureProjection: async (card, projectionDeps) =>
        ensureCommandCardProjection(projectionDeps, card),
      certify: (ids) => deps.commandCardStorage.certifyCommandCardVersions(ids),
      cardId: (card) => card.id,
    }),
  previewCommandCard: async (
    card: CommandCard,
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
