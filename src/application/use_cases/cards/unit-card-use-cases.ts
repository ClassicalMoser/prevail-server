import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type {
  DataErrorSignature,
  ErrorSignature,
  NoContentSignature,
  UnitCardUseCasesPort,
} from '@ports';
import { mapVoidToNoContent } from '@ports';
import { createUnitCardVersion } from './create-unit-card-version';
import { getAllUnitCards } from './get-all-unit-cards';
import { previewUnitCard } from './preview-unit-card';
import { updateUnitCardCertifications } from './update-unit-card-certifications';
import type { UnitCardUseCasesDeps } from './unit-card-use-cases-deps';

/**
 * Catalog and preview use cases for unit cards.
 *
 * Each use case with its own policy is its own file; this builds the port from
 * them. A method that only hands the call to storage stays here as one line.
 *
 * @param deps - Storage, renderer, and asset ports.
 * @returns The unit-card use-case port.
 */
const createUnitCardUseCases = (
  deps: UnitCardUseCasesDeps,
): UnitCardUseCasesPort => ({
  getCurrentUnitCards: async (): Promise<DataErrorSignature<UnitType[]>> =>
    deps.unitCardStorage.getCurrentUnitCards(),
  getAllUnitCards: () => getAllUnitCards(deps),
  getUnitCardById: async (id: string): Promise<DataErrorSignature<UnitType>> =>
    deps.unitCardStorage.getUnitCardById(id),
  getUnitCardsByIds: async (
    ids: string[],
  ): Promise<DataErrorSignature<UnitType[]>> =>
    deps.unitCardStorage.getUnitCardsByIds(ids),
  createEmptyUnitCard: async (): Promise<DataErrorSignature<string>> =>
    deps.unitCardStorage.createEmptyUnitCard(),
  createUnitCardVersion: (unitType) => createUnitCardVersion(deps, unitType),
  deleteEmptyUnitCards: async (): Promise<
    ErrorSignature | NoContentSignature
  > => mapVoidToNoContent(await deps.unitCardStorage.deleteEmptyUnitCards()),
  updateUnitCardCertifications: () => updateUnitCardCertifications(deps),
  previewUnitCard: (unitType) => previewUnitCard(deps, unitType),
});

export type { UnitCardUseCasesDeps };
export { createUnitCardUseCases };
