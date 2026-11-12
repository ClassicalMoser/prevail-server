import type { CommandCard } from '@classicalmoser/prevail-rules/domain';

type PartialCard = Pick<
  CommandCard,
  | 'initiative'
  | 'modifiers'
  | 'command'
  | 'roundEffect'
  | 'unitSupport'
  | 'cost'
>;

/** One `command_cards` row: the stable id a card's versions hang from. */
interface CommandCardDb {
  command_card_id: string;
  created_at: Date;
}

/** One stored version of a command card, as read back from postgres. */
interface CommandCardVersionDb {
  command_card_id: string;
  command_card_version_id: string;
  command_card_name: string;
  command_card_definition: PartialCard;
  version_major: number;
  version_minor: number;
  version_patch: number;
}

/** Columns for inserting a command card version; the definition is serialized JSON. */
interface WriteCommandCardVersionDb {
  command_card_id: string;
  command_card_name: string;
  command_card_definition: string;
  version_major: number;
  version_minor: number;
  version_patch: number;
}

/** A command card version with whether it is certified against the latest rules. */
interface CommandCardCertificationStatusDb extends CommandCardVersionDb {
  certified: boolean;
}

export type {
  CommandCardDb,
  CommandCardVersionDb,
  CommandCardCertificationStatusDb,
  WriteCommandCardVersionDb,
  PartialCard,
};
