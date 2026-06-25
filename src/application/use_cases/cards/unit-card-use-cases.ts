import { unitTypeSchema } from '@classicalmoser/prevail-rules/domain';
import type {
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

const createUnitCardUseCases = (
  unitCardStorage: UnitCardStorage,
  unitCardRenderer: UnitCardRendererPort,
): UnitCardUseCasesPort => ({
  getCurrentUnitCards: async (): Promise<DataErrorSignature<UnitType[]>> =>
    unitCardStorage.getCurrentUnitCards(),
  getAllUnitCards: async (): Promise<DataErrorSignature<CardListItem[]>> =>
    unitCardStorage.getAllUnitCards(),
  getUnitCardById: async (id: string): Promise<DataErrorSignature<UnitType>> =>
    unitCardStorage.getUnitCardById(id),
  getUnitCardsByIds: async (
    ids: string[],
  ): Promise<DataErrorSignature<UnitType[]>> =>
    unitCardStorage.getUnitCardsByIds(ids),
  createEmptyUnitCard: async (): Promise<DataErrorSignature<string>> =>
    unitCardStorage.createEmptyUnitCard(),
  createUnitCardVersion: async (
    unitType: UnitType,
  ): Promise<DataErrorSignature<UnitType>> =>
    unitCardStorage.createUnitCardVersion(unitType),
  deleteEmptyUnitCards: async (): Promise<
    ErrorSignature | NoContentSignature
  > => {
    const result = await unitCardStorage.deleteEmptyUnitCards();
    if (!result.success) {
      return result;
    }

    return noContentSuccess();
  },
  updateUnitCardCertifications: async (): Promise<
    DataErrorSignature<CertificationResults>
  > => {
    const beforeResult =
      await unitCardStorage.getLatestUnitCardCertifications();
    if (!beforeResult.success) {
      return beforeResult;
    }

    const validUnitCardIds = beforeResult.data
      .filter(({ card }) => unitTypeSchema.safeParse(card).success)
      .map(({ card }) => card.id);

    const certifyResult =
      await unitCardStorage.certifyUnitCardVersions(validUnitCardIds);
    if (!certifyResult.success) {
      return certifyResult;
    }

    const afterResult = await unitCardStorage.getLatestUnitCardCertifications();
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
  ): Promise<DataErrorSignature<string>> =>
    unitCardRenderer.renderUnitCard(unitType, { bleed: false }),
});

export { createUnitCardUseCases };
