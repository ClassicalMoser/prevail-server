import type { OxlintConfig } from 'oxlint';
import boundaries from './oxlint-boundaries.config.ts';
import ignorePatterns from './oxlint-ignore-patterns.config.ts';
import disableJestRules from './oxlint-disable-jest-rules.config.ts';
import regexp from './oxlint-regexp.config.ts';

const config: OxlintConfig = {
  extends: [boundaries, ignorePatterns, disableJestRules, regexp],
};

export default config;
