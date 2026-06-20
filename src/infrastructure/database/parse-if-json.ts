/**
 * Postgres does not reliably return JSON objects as either strings or objects.
 * This function checks if the value is a string and parses it if it is.
 * The result is to get an object in either case.
 */

function parseIfJson<T>(value: string | T): T {
  if (typeof value === 'string') {
    const parsedValue = JSON.parse(value) as T;
    return parsedValue;
  }
  return value;
}

export { parseIfJson };
