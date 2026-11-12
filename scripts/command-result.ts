/**
 * What one script command produces.
 *
 * A command never prints and never exits. It hands back what to say and
 * whether it failed, so the entry point owns the one print site and the one
 * exit path, and a command stays a function anything can call.
 */
export interface CommandResult {
  /** The text to print, whether the command passed or failed. */
  output: string;
  /** Why the command failed, or null when it passed. */
  failure: string | null;
}
