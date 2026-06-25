interface CardListItemVersionDb {
  version_major: number | null;
  version_minor: number | null;
  version_patch: number | null;
}

interface CommandCardListItemDb extends CardListItemVersionDb {
  command_card_id: string;
  command_card_name: string | null;
}

interface UnitCardListItemDb extends CardListItemVersionDb {
  unit_card_id: string;
  unit_card_name: string | null;
}

export type {
  CardListItemVersionDb,
  CommandCardListItemDb,
  UnitCardListItemDb,
};
