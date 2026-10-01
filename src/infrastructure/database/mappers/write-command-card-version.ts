import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { commandCardSchema } from '@classicalmoser/prevail-rules/domain';
import type { WriteCommandCardVersionDb } from '../db-types';
import { parseVersionTriple } from './parse-version-triple';

/**
 * Split a domain command card into columns plus a JSON definition.
 *
 * `commandCardSchema.parse` rejects a card the domain would not accept, so a
 * bad write fails before it is inserted. Identity, name, and the version
 * triple are columns. The definition stores the rules payload only.
 *
 * @param card - Domain card to persist as a new version.
 * @returns The row shape the insert query expects.
 */
const writeCommandCardVersionMapper = (
  card: CommandCard,
): WriteCommandCardVersionDb => {
  const validatedCard = commandCardSchema.parse(card);
  const versionTriple = parseVersionTriple(validatedCard.version);
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
    version_major: versionTriple.major,
    version_minor: versionTriple.minor,
    version_patch: versionTriple.patch,
  };
  return cardWrite;
};

export { writeCommandCardVersionMapper };
