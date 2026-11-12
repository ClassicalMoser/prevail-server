/**
 * The browser origins allowed to call this server when none are configured:
 * the desktop app's dev server, and the production web app.
 */
const DEFAULT_CLIENT_ORIGINS =
  'http://localhost:1420,http://127.0.0.1:1420,https://app.prevailgame.com';

/**
 * Read the CORS origin allowlist from a comma-separated setting.
 *
 * @param raw - The `CLIENT_ORIGINS` value, if set.
 * @returns One trimmed origin per entry, blanks dropped. Defaults when unset.
 */
const readClientOrigins = (raw: string | undefined): string[] => {
  // Entries are trimmed and blanks dropped, so a stray comma never becomes an
  // empty origin.
  const origins = (raw ?? DEFAULT_CLIENT_ORIGINS)
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
  return origins;
};

export { readClientOrigins };
