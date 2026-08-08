interface VersionTriple {
  major: number;
  minor: number;
  patch: number;
}

const parseVersionTriple = (version: string): VersionTriple => {
  const [major, minor, patch] = version.split('.');
  return {
    major: Number.parseInt(major, 10),
    minor: Number.parseInt(minor, 10),
    patch: Number.parseInt(patch, 10),
  };
};

const formatVersionTriple = ({ major, minor, patch }: VersionTriple): string =>
  `${major}.${minor}.${patch}`;

export type { VersionTriple };
export { formatVersionTriple, parseVersionTriple };
