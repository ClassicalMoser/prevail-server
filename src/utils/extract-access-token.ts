/**
 * Resolves a bearer token from Authorization, or `access_token` query for
 * browser WebSocket upgrades (which cannot set Authorization headers).
 */
const extractAccessToken = (
  headers: Readonly<Record<string, string | undefined>>,
  query: Readonly<Record<string, string | string[] | undefined>>,
): string | undefined => {
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

  const raw = query.access_token;
  if (typeof raw === 'string' && raw !== '') {
    return raw;
  }
  if (Array.isArray(raw)) {
    const first = raw[0];
    if (typeof first === 'string' && first !== '') {
      return first;
    }
  }

  return undefined;
};

export { extractAccessToken };
