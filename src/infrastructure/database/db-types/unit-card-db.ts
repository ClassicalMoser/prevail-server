import type { UnitType } from '@classicalmoser/prevail-rules/domain';

type PartialUnitType = Pick<
  UnitType,
  'traits' | 'stats' | 'cost' | 'limit' | 'morale'
>;

interface UnitCardDb {
  unit_card_id: string;
  created_at: Date;
}

interface UnitCardVersionDb {
  unit_card_id: string;
  unit_card_version_id: string;
  unit_card_artwork_url: string | null;
  unit_card_name: string;
  unit_card_definition: PartialUnitType;
  version_major: number;
  version_minor: number;
  version_patch: number;
}

interface WriteUnitCardVersionDb {
  unit_card_id: string;
  unit_card_artwork_url: string | null;
  unit_card_name: string;
  unit_card_definition: string;
  version_major: number;
  version_minor: number;
  version_patch: number;
}

interface UnitCardCertificationStatusDb extends UnitCardVersionDb {
  certified: boolean;
}

export type {
  PartialUnitType,
  UnitCardDb,
  UnitCardVersionDb,
  UnitCardCertificationStatusDb,
  WriteUnitCardVersionDb,
};
