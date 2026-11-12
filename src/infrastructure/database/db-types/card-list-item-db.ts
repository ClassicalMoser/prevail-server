/** Version columns of a catalog list row; null when the card has no version yet. */
interface CardListItemVersionDb {
  version_major: number | null;
  version_minor: number | null;
  version_patch: number | null;
}

/** A command card's catalog list row: id plus its newest version's name and version. */
interface CommandCardListItemDb extends CardListItemVersionDb {
  command_card_id: string;
  command_card_name: string | null;
}

/** A unit card's catalog list row: id plus its newest version's name and version. */
interface UnitCardListItemDb extends CardListItemVersionDb {
  unit_card_id: string;
  unit_card_name: string | null;
}

export type {
  CardListItemVersionDb,
  CommandCardListItemDb,
  UnitCardListItemDb,
};
