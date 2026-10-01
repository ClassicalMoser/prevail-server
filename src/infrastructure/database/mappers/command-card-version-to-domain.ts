import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { parseIfJson } from '../parse-if-json';
import type { CommandCardVersionDb, PartialCard } from '../db-types';
import { formatVersionTriple } from './format-version-triple';

/**
 * Rebuild a domain command card from a version row.
 *
 * Identity and name live in columns. The rest of the card is the JSON
 * definition. The version string is rebuilt from the triple columns so a
 * stale `version` inside the JSON cannot disagree with the row.
 *
 * @param version - One command-card version row.
 * @returns The domain card for that row.
 */
const commandCardVersionMapperToDomain = (
  version: CommandCardVersionDb,
): CommandCard => {
  const partialCard: PartialCard = parseIfJson(version.command_card_definition);
  const versionLabel = formatVersionTriple({
    major: version.version_major,
    minor: version.version_minor,
    patch: version.version_patch,
  });
  const card: CommandCard = {
    id: version.command_card_id,
    name: version.command_card_name,
    ...partialCard,
    version: versionLabel,
  };
  return card;
};

export { commandCardVersionMapperToDomain };
