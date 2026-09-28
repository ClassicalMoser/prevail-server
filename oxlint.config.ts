import type { OxlintConfig } from 'oxlint';
import { createOxlintConfig } from 'classicalmoser-oxlint-config';
import { boundaries } from './boundaries.ts';

const config: OxlintConfig = createOxlintConfig({
  boundaries,
  filenameCase: 'kebabCase',
});

export default config;
