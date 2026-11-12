import type { UnitType } from '@classicalmoser/prevail-rules/domain';

type PartialUnitType = Pick<
  UnitType,
  'traits' | 'stats' | 'cost' | 'limit' | 'morale'
>;

/** One `unit_cards` row: the stable id a card's versions hang from. */
interface UnitCardDb {
  unit_card_id: string;
  created_at: Date;
}

/** One stored version of a unit card, as read back from postgres. */
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

/** Columns for inserting a unit card version; the definition is serialized JSON. */
interface WriteUnitCardVersionDb {
  unit_card_id: string;
  unit_card_artwork_url: string | null;
  unit_card_name: string;
  unit_card_definition: string;
  version_major: number;
  version_minor: number;
  version_patch: number;
}

/** A unit card version with whether it is certified against the latest rules. */
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
