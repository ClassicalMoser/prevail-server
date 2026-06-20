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
