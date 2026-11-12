import { measureScopes } from './measure-scopes';
import { reportCommentary } from './report-commentary';
import type { CommandResult } from '../command-result';

/**
 * Reports in-body commentary density per layer, and passes.
 *
 * It renders no verdict, by design. `STYLE.md` asks for 25% comments inside a
 * body, but the thing the standard is really asking for is that a comment say
 * what happens in the game and why the rules want it, and no measure can see
 * that. A gate on the number would be satisfied by restating the code beneath
 * it, which the style guide calls worse than saying nothing — so a passing
 * build could mean the suite got harder to read.
 *
 * An earlier version of this command recorded a floor per layer and failed
 * when a layer fell below it. That went out: a floor is a mechanized judgment
 * about meaning, it pushed toward padding rather than explanation, and it
 * treated authored commentary as a number to defend.
 *
 * So this informs the human read instead of standing in for it. Run it to see
 * where a layer stands before and after working on it.
 *
 * @returns The per-layer report, which never fails
 */
export async function checkCommentaryDensity(): Promise<CommandResult> {
  const measured = await measureScopes();
  const report = reportCommentary(measured);
  const result: CommandResult = { failure: null, output: report.join('\n') };
  return result;
}
