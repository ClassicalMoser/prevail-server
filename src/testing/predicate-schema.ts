/**
 * A stand-in for a contract's Zod schema: it accepts what a check accepts.
 *
 * Socket helpers only call `safeParse`, so a route test can hand them this
 * instead of building a real contract.
 *
 * @param accepts - Says whether a value is the shape the schema stands for.
 * @returns An object with the `safeParse` the helpers call.
 */
const predicateSchema = <TData>(
  accepts: (value: unknown) => value is TData,
): {
  safeParse: (
    value: unknown,
  ) => { success: true; data: TData } | { success: false };
} => {
  const safeParse = (
    value: unknown,
  ): { success: true; data: TData } | { success: false } => {
    if (accepts(value)) {
      return { data: value, success: true };
    }
    return { success: false };
  };
  return { safeParse };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Stands for a message with no fields: any object is accepted. */
const recordSchema = predicateSchema(isRecord);

/** Stands for the `{ gameId }` params every game socket path carries. */
const gameIdParamsSchema = predicateSchema(
  (value: unknown): value is { gameId: string } =>
    isRecord(value) && typeof value.gameId === 'string',
);

export { gameIdParamsSchema, predicateSchema, recordSchema };
