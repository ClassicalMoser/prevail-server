import { unitTypeSchema } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  CertificationResults,
  DataErrorSignature,
  ErrorSignature,
  NoContentSignature,
  UnitCardRendererPort,
  UnitCardStorage,
  UnitCardUseCasesPort,
} from '@ports';
import { mapVoidToNoContent } from '@ports';
import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import {
  allUnitCardAssetsExist,
  certifyCardVersions,
  ensureUnitCardProjection,
  projectUnitCardVersion,
  toContractCardListItem,
} from '@application/composable';

interface UnitCardUseCasesDeps {
  unitCardStorage: UnitCardStorage;
  unitCardRenderer: UnitCardRendererPort;
  assetStorage: AssetStorage;
}

const createUnitCardUseCases = (
  deps: UnitCardUseCasesDeps,
): UnitCardUseCasesPort => ({
  getCurrentUnitCards: async (): Promise<DataErrorSignature<UnitType[]>> =>
    deps.unitCardStorage.getCurrentUnitCards(),
  getAllUnitCards: async (): Promise<DataErrorSignature<CardListItem[]>> => {
    const result = await deps.unitCardStorage.getAllUnitCards();
    if (!result.success) {
      return result;
    }
    return {
      success: true,
      data: result.data.map(toContractCardListItem),
    };
  },
  getUnitCardById: async (id: string): Promise<DataErrorSignature<UnitType>> =>
    deps.unitCardStorage.getUnitCardById(id),
  getUnitCardsByIds: async (
    ids: string[],
  ): Promise<DataErrorSignature<UnitType[]>> =>
    deps.unitCardStorage.getUnitCardsByIds(ids),
  createEmptyUnitCard: async (): Promise<DataErrorSignature<string>> =>
    deps.unitCardStorage.createEmptyUnitCard(),
  createUnitCardVersion: async (
    unitType: UnitType,
  ): Promise<DataErrorSignature<UnitType>> => {
    const insertResult =
      await deps.unitCardStorage.createUnitCardVersion(unitType);
    if (!insertResult.success) {
      return insertResult;
    }

    const projectResult = await projectUnitCardVersion(
      {
        assetStorage: deps.assetStorage,
        unitCardRenderer: deps.unitCardRenderer,
      },
      { ...unitType, ...insertResult.data },
    );
    if (!projectResult.success) {
      await deps.unitCardStorage.deleteUnitCardVersion(insertResult.data);
      return projectResult;
    }

    return insertResult;
  },
  deleteEmptyUnitCards: async (): Promise<
    ErrorSignature | NoContentSignature
  > => mapVoidToNoContent(await deps.unitCardStorage.deleteEmptyUnitCards()),
  updateUnitCardCertifications: async (): Promise<
    DataErrorSignature<CertificationResults>
  > =>
    certifyCardVersions<UnitType>({
      getLatest: () => deps.unitCardStorage.getLatestUnitCardCertifications(),
      isSchemaValid: (card) => unitTypeSchema.safeParse(card).success,
      allAssetsExist: async (card) =>
        allUnitCardAssetsExist(deps.assetStorage, card),
      ensureProjection: async (card) =>
        ensureUnitCardProjection(
          {
            assetStorage: deps.assetStorage,
            unitCardRenderer: deps.unitCardRenderer,
          },
          card,
        ),
      certify: (ids) => deps.unitCardStorage.certifyUnitCardVersions(ids),
      cardId: (card) => card.id,
    }),
  previewUnitCard: async (
    unitType: UnitType,
  ): Promise<DataErrorSignature<string>> => {
    const renderResult = await deps.unitCardRenderer.renderUnitCard(unitType, {
      bleed: false,
      format: 'svg',
      unitImage: false,
    });
    if (!renderResult.success) {
      return renderResult;
    }

    return {
      success: true,
      data: renderResult.data.toString('utf8'),
    };
  },
});

export type { UnitCardUseCasesDeps };
export { createUnitCardUseCases };
