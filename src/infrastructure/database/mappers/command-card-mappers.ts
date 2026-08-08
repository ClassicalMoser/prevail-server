import type {
  CommandCardVersionDb,
  WriteCommandCardVersionDb,
  PartialCard,
} from '../db-types';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { commandCardSchema } from '@classicalmoser/prevail-rules/domain';
import { parseIfJson } from '../parse-if-json';
import { formatVersionTriple, parseVersionTriple } from './version-mappers';

const commandCardVersionMapperToDomain = (
  version: CommandCardVersionDb,
): CommandCard => {
  const partialCard: PartialCard = parseIfJson(version.command_card_definition);
  return {
    id: version.command_card_id,
    name: version.command_card_name,
    ...partialCard,
    version: formatVersionTriple({
      major: version.version_major,
      minor: version.version_minor,
      patch: version.version_patch,
    }),
  };
};

const writeCommandCardVersionMapper = (
  card: CommandCard,
): WriteCommandCardVersionDb => {
  const validatedCard = commandCardSchema.parse(card);
  const { major, minor, patch } = parseVersionTriple(validatedCard.version);

  const definition = {
    initiative: validatedCard.initiative,
    modifiers: validatedCard.modifiers,
    command: validatedCard.command,
    roundEffect: validatedCard.roundEffect,
    unitSupport: validatedCard.unitSupport,
  };

  const cardWrite: WriteCommandCardVersionDb = {
    command_card_id: validatedCard.id,
    command_card_name: validatedCard.name,
    command_card_definition: JSON.stringify(definition),
    version_major: major,
    version_minor: minor,
    version_patch: patch,
  };
  return cardWrite;
};

export { commandCardVersionMapperToDomain, writeCommandCardVersionMapper };
