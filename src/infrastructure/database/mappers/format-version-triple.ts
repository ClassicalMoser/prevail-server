import type { VersionTriple } from './version-triple';

/**
 * Join a stored version triple back into the domain's dotted string.
 *
 * @param triple - Major, minor, and patch columns from a version row.
 * @returns `major.minor.patch`.
 */
const formatVersionTriple = ({
  major,
  minor,
  patch,
}: VersionTriple): string => {
  const version = `${major}.${minor}.${patch}`;
  return version;
};

export { formatVersionTriple };
