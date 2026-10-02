/**
 * Read a Bearer token from request headers.
 *
 * Accepts either `authorization` or `Authorization`. Anything that is not
 * `Bearer <token>` with a non-empty token is treated as absent so auth
 * middleware can return 401 without parsing junk schemes.
 *
 * @param headers - Normalized request headers (single string values).
 * @returns The token string, or undefined when the header is missing or malformed.
 */
const extractBearerToken = (
  headers: Readonly<Record<string, string | undefined>>,
): string | undefined => {
  const authorization = headers.authorization ?? headers.Authorization;
  if (authorization === undefined) {
    return undefined;
  }

  const [scheme, token] = authorization.split(' ');
  if (
    scheme?.toLowerCase() !== 'bearer' ||
    token === undefined ||
    token === ''
  ) {
    return undefined;
  }

  return token;
};

export { extractBearerToken };
