import type {
  CommandCardVersionDb,
  WriteCommandCardVersionDb,
  PartialCard,
} from '../db-types';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { commandCardSchema } from '@classicalmoser/prevail-rules/domain';
import { parseIfJson } from '../parse-if-json';

const commandCardVersionMapperToDomain = (
  version: CommandCardVersionDb,
): CommandCard => {
  const partialCard: PartialCard = parseIfJson(version.command_card_definition);
  const versionNumber = `${version.version_major}.${version.version_minor}.${version.version_patch}`;
  return {
    id: version.command_card_id,
    name: version.command_card_name,
    ...partialCard,
    version: versionNumber,
  };
};

const writeCommandCardVersionMapper = (
  card: CommandCard,
): WriteCommandCardVersionDb => {
  const validatedCard = commandCardSchema.parse(card);
  const majorVersion = Number.parseInt(validatedCard.version.split('.')[0], 10);
  const minorVersion = Number.parseInt(validatedCard.version.split('.')[1], 10);
  const patchVersion = Number.parseInt(validatedCard.version.split('.')[2], 10);

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
    version_major: majorVersion,
    version_minor: minorVersion,
    version_patch: patchVersion,
  };
  return cardWrite;
};

export { commandCardVersionMapperToDomain, writeCommandCardVersionMapper };
