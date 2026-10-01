import { formatVersionTriple } from './format-version-triple';

/**
 * Format a catalog list row's version columns.
 *
 * A row with no certified version stores null in every version column. Callers
 * treat that as "no version yet", so null major stays null instead of becoming
 * `0.0.0`.
 *
 * @param major - Major column, null when the card has no version.
 * @param minor - Minor column. Null is written as 0 only when major is present.
 * @param patch - Patch column. Null is written as 0 only when major is present.
 * @returns The dotted version, or null when the card has no version.
 */
const formatListItemVersion = (
  major: number | null,
  minor: number | null,
  patch: number | null,
): string | null => {
  if (major === null) {
    return null;
  }
  const version = formatVersionTriple({
    major,
    minor: minor ?? 0,
    patch: patch ?? 0,
  });
  return version;
};

export { formatListItemVersion };
