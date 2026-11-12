/**
 * Resolves a bearer token from Authorization, or `access_token` query for
 * browser WebSocket upgrades (which cannot set Authorization headers).
 */
const extractAccessToken = (
  headers: Readonly<Record<string, string | undefined>>,
  query: Readonly<Record<string, string | string[] | undefined>>,
): string | undefined => {
  // The header wins when present and well formed; otherwise fall back to the
  // query value a browser socket must use.
  const authorization = headers.authorization ?? headers.Authorization;
  if (authorization !== undefined) {
    const [scheme, token] = authorization.split(' ');
    if (
      scheme?.toLowerCase() === 'bearer' &&
      token !== undefined &&
      token !== ''
    ) {
      return token;
    }
  }

  // Query fallback: browsers cannot set Authorization on a socket upgrade. A token
  // in a URL is easier to leak through logs than a header.
  const raw = query.access_token;
  if (typeof raw === 'string' && raw !== '') {
    return raw;
  }
  // A repeated access_token parameter: the first one is used.
  if (Array.isArray(raw)) {
    const first = raw[0];
    if (typeof first === 'string' && first !== '') {
      return first;
    }
  }

  return undefined;
};

export { extractAccessToken };
