import type {
  CommandCardVersionDb,
  WriteCommandCardVersionDb,
  PartialCard,
} from '../db-types';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { commandCardSchema } from '@classicalmoser/prevail-rules/domain';
import { parseIfJson } from '../parse-if-json';
import { formatVersionTriple, parseVersionTriple } from './version-mappers';

/** Stable ascending sort by initiative for any multi-card fetch. */
const sortCommandCardsByInitiative = <T extends { initiative: number }>(
  cards: readonly T[],
): T[] => cards.toSorted((a, b) => a.initiative - b.initiative);

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

const mapCommandCardVersions = (
  versions: readonly CommandCardVersionDb[],
): CommandCard[] =>
  sortCommandCardsByInitiative(
    versions.map((version) => commandCardVersionMapperToDomain(version)),
  );

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

export {
  commandCardVersionMapperToDomain,
  mapCommandCardVersions,
  sortCommandCardsByInitiative,
  writeCommandCardVersionMapper,
};
