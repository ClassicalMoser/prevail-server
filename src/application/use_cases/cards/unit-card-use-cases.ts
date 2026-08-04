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
import { noContentSuccess } from '@ports';
import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import {
  allUnitCardAssetsExist,
  ensureUnitCardProjection,
  projectUnitCardVersion,
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
  getAllUnitCards: async (): Promise<DataErrorSignature<CardListItem[]>> =>
    deps.unitCardStorage.getAllUnitCards(),
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
  > => {
    const result = await deps.unitCardStorage.deleteEmptyUnitCards();
    if (!result.success) {
      return result;
    }

    return noContentSuccess();
  },
  updateUnitCardCertifications: async (): Promise<
    DataErrorSignature<CertificationResults>
  > => {
    const beforeResult =
      await deps.unitCardStorage.getLatestUnitCardCertifications();
    if (!beforeResult.success) {
      return beforeResult;
    }

    const uncertifiedStatuses = beforeResult.data.filter(
      ({ certified }) => !certified,
    );

    const schemaValidStatuses = uncertifiedStatuses.filter(
      ({ card }) => unitTypeSchema.safeParse(card).success,
    );

    const projectionDeps = {
      assetStorage: deps.assetStorage,
      unitCardRenderer: deps.unitCardRenderer,
    };

    const statusesMissingAssets = [];
    for (const entry of schemaValidStatuses) {
      if (!(await allUnitCardAssetsExist(deps.assetStorage, entry.card))) {
        statusesMissingAssets.push(entry);
      }
    }

    for (const { card } of statusesMissingAssets) {
      const healResult = await ensureUnitCardProjection(projectionDeps, card);
      if (!healResult.success) {
        return healResult;
      }
    }

    const readyToCertify: string[] = [];
    for (const { card } of schemaValidStatuses) {
      if (await allUnitCardAssetsExist(deps.assetStorage, card)) {
        readyToCertify.push(card.id);
      }
    }

    const certifyResult =
      await deps.unitCardStorage.certifyUnitCardVersions(readyToCertify);
    if (!certifyResult.success) {
      return certifyResult;
    }

    const afterResult =
      await deps.unitCardStorage.getLatestUnitCardCertifications();
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
