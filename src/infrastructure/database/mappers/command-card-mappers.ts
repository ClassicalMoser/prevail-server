import type {
  CommandCardVersionDb,
  WriteCommandCardVersionDb,
  PartialCard,
} from '../db-types';
import type { Card } from '@classicalmoser/prevail-rules/domain';
import { parseIfJson } from '../parse-if-json';

const commandCardVersionMapperToDomain = (
  version: CommandCardVersionDb,
): Card => {
  // Most traits come from the JSON definition field
  const partialCard: PartialCard = parseIfJson(version.command_card_definition);
  // Combine semver fields into a single version string
  const versionNumber = `${version.version_major}.${version.version_minor}.${version.version_patch}`;
  // Combine all fields into a single card object
  const card: Card = {
    id: version.command_card_version_id,
    name: version.command_card_name,
    ...partialCard,
    version: versionNumber,
  };
  // Return the combined card object
  return card;
};

const writeCommandCardVersionMapper = (
  card: Card,
): WriteCommandCardVersionDb => {
  const majorVersion = Number.parseInt(card.version.split('.')[0], 10);
  const minorVersion = Number.parseInt(card.version.split('.')[1], 10);
  const patchVersion = Number.parseInt(card.version.split('.')[2], 10);

  const definition = {
    initiative: card.initiative,
    modifiers: card.modifiers,
    command: card.command,
    roundEffect: card.roundEffect,
    unitSupport: card.unitSupport,
  };

  const cardWrite: WriteCommandCardVersionDb = {
    command_card_id: card.id,
    command_card_name: card.name,
    command_card_definition: JSON.stringify(definition),
    version_major: majorVersion,
    version_minor: minorVersion,
    version_patch: patchVersion,
  };
  return cardWrite;
};

export { commandCardVersionMapperToDomain, writeCommandCardVersionMapper };
