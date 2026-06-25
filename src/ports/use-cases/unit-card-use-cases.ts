import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type {
  DataErrorSignature,
  ErrorSignature,
  NoContentSignature,
} from '@ports/data-error-signature-port';
import type { CertificationResults } from './command-card-use-cases';

interface UnitCardUseCasesPort {
  getCurrentUnitCards: () => Promise<DataErrorSignature<UnitType[]>>;
  getAllUnitCards: () => Promise<DataErrorSignature<CardListItem[]>>;
  getUnitCardById: (id: string) => Promise<DataErrorSignature<UnitType>>;
  getUnitCardsByIds: (ids: string[]) => Promise<DataErrorSignature<UnitType[]>>;
  createEmptyUnitCard: () => Promise<DataErrorSignature<string>>;
  createUnitCardVersion: (
    unitType: UnitType,
  ) => Promise<DataErrorSignature<UnitType>>;
  deleteEmptyUnitCards: () => Promise<ErrorSignature | NoContentSignature>;
  updateUnitCardCertifications: () => Promise<
    DataErrorSignature<CertificationResults>
  >;
  previewUnitCard: (unitType: UnitType) => Promise<DataErrorSignature<string>>;
}

export type { UnitCardUseCasesPort };
