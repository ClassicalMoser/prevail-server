/**
 * Read an environment variable the server cannot start without.
 *
 * Startup fails here, naming the variable, instead of failing later in an
 * adapter with a message about a missing connection or key.
 *
 * @param env - The process environment.
 * @param name - Variable to read.
 * @returns The variable's value, which is never empty.
 */
const requireEnv = (
  env: Readonly<Record<string, string | undefined>>,
  name: string,
): string => {
  const value = env[name];
  if (value === undefined || value === '') {
    throw new Error(`${name} is not set`);
  }
  return value;
};

export { requireEnv };
