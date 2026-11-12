import { checkCommentaryDensity } from './commentary/check-commentary-density';
import type { CommandResult } from './command-result';

/**
 * The one way to run this repository's scripts: `tsx scripts/main.ts <command>`.
 *
 * Each command is a function in its own directory that returns what to print
 * and whether it failed. This file holds the only print site and the only exit
 * path, so no script prints or exits at import time and every one stays
 * importable.
 */

/** Every command, by the name used on the command line. */
const commands = new Map<string, () => Promise<CommandResult>>([
  ['commentary', checkCommentaryDensity],
]);

const name = process.argv[2];
const command = name === undefined ? undefined : commands.get(name);

if (command === undefined) {
  // Naming the commands beats a usage string that drifts from the map above.
  const known = [...commands.keys()].join(', ');
  throw new Error(`Unknown script command '${name ?? ''}'. Known: ${known}`);
}

const result = await command();

// eslint-disable-next-line no-console
console.log(result.output);

// Throwing is what gives the non-zero exit; the output above says what to fix.
if (result.failure !== null) {
  throw new Error(result.failure);
}
