import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { DataErrorSignature } from '@ports/data-error-signature-port';

/** The latest version of a unit card and whether it is certified for the
 * latest rules version. Keyed on the stable unit card (entity) id. */
interface UnitCardCertificationStatus {
  card: UnitType;
  certified: boolean;
}

interface UnitCardStorage {
  getCurrentUnitCards: () => Promise<DataErrorSignature<UnitType[]>>;
  getAllUnitCards: () => Promise<DataErrorSignature<CardListItem[]>>;
  getUnitCardById: (id: string) => Promise<DataErrorSignature<UnitType>>;
  getUnitCardsByIds: (ids: string[]) => Promise<DataErrorSignature<UnitType[]>>;
  createEmptyUnitCard: () => Promise<DataErrorSignature<string>>;
  createUnitCardVersion: (
    unitType: UnitType,
  ) => Promise<DataErrorSignature<UnitType>>;
  deleteUnitCardVersion: (
    unitType: UnitType,
  ) => Promise<DataErrorSignature<void>>;
  deleteEmptyUnitCards: () => Promise<DataErrorSignature<void>>;
  getLatestUnitCardCertifications: () => Promise<
    DataErrorSignature<UnitCardCertificationStatus[]>
  >;
  certifyUnitCardVersions: (
    unitCardIds: string[],
  ) => Promise<DataErrorSignature<void>>;
}

export type { UnitCardStorage, UnitCardCertificationStatus };
