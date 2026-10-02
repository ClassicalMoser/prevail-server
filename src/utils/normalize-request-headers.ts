/**
 * Collapse Node/Fastify multi-value headers into single strings.
 *
 * When a header appears more than once, the first value wins. Missing keys
 * stay absent so callers can tell "unset" from "empty string".
 *
 * @param headers - Raw headers where a value may be a string or string array.
 * @returns A map of header name to at most one string value.
 */
const normalizeRequestHeaders = (
  headers: Readonly<Record<string, string | string[] | undefined>>,
): Readonly<Record<string, string | undefined>> => {
  const result: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      result[key] = Array.isArray(value) ? value[0] : value;
    }
  }
  return result;
};

export { normalizeRequestHeaders };
