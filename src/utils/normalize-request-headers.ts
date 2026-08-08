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
