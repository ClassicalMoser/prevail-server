import type { Card } from '@classicalmoser/prevail-rules/domain';

type PartialCard = Pick<
  Card,
  'initiative' | 'modifiers' | 'command' | 'roundEffect' | 'unitSupport'
>;

interface CommandCardDb {
  command_card_id: string;
  created_at: Date;
}

interface CommandCardVersionDb {
  command_card_id: string;
  command_card_version_id: string;
  command_card_name: string;
  command_card_definition: PartialCard;
  version_major: number;
  version_minor: number;
  version_patch: number;
}

interface WriteCommandCardVersionDb {
  command_card_id: string;
  command_card_name: string;
  command_card_definition: string;
  version_major: number;
  version_minor: number;
  version_patch: number;
}

export type {
  CommandCardDb,
  CommandCardVersionDb,
  WriteCommandCardVersionDb,
  PartialCard,
};
