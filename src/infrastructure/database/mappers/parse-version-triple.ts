import type { VersionTriple } from './version-triple';

/**
 * Split a dotted card version into its numeric parts.
 *
 * Missing segments become `NaN`, matching `Number.parseInt` on an absent piece.
 * Callers persist versions that already passed the card schema, so a short
 * string is a storage bug rather than a case this mapper repairs.
 *
 * @param version - `major.minor.patch` text from a domain card.
 * @returns The three numeric components.
 */
const parseVersionTriple = (version: string): VersionTriple => {
  const [major, minor, patch] = version.split('.');
  const triple: VersionTriple = {
    major: Number.parseInt(major, 10),
    minor: Number.parseInt(minor, 10),
    patch: Number.parseInt(patch, 10),
  };
  return triple;
};

export { parseVersionTriple };
