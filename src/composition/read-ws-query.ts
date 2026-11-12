/**
 * Keep the query-string values a socket route may read.
 *
 * Fastify's `query` is untyped. Only strings and arrays of strings are kept,
 * so the auth check never sees a nested object a client crafted into the URL.
 *
 * @param query - Fastify's parsed query for the upgrade request.
 * @returns The string-valued entries, by name.
 */
const readWsQuery = (
  query: unknown,
): Record<string, string | string[] | undefined> => {
  const record: Record<string, string | string[] | undefined> = {};
  // No query object means no entries, not an error.
  if (typeof query !== 'object' || query === null) {
    return record;
  }
  // Anything but strings and string arrays is dropped rather than passed on to
  // auth.
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      record[key] = value;
    } else if (
      Array.isArray(value) &&
      value.every((entry) => typeof entry === 'string')
    ) {
      record[key] = value;
    }
  }
  return record;
};

export { readWsQuery };
