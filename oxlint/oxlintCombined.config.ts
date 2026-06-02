import type { OxlintConfig } from "oxlint";
import boundaries from "./oxlintBoundaries.config.ts";
import ignorePatterns from "./oxlintIgnorePatterns.config.ts";
import disableJestRules from "./oxlintDisableJestRules.config.ts";
import regexp from "./oxlintRegexp.config.ts";

const config: OxlintConfig = {
  extends: [boundaries, ignorePatterns, disableJestRules, regexp],
};

export default config;
