import { predicateSchema, recordSchema } from '@testing';
import { createInboundHandler } from './create-inbound-handler';

// A schema for { n: number }, enough to tell a valid payload from an invalid
// one.
const numberBox = predicateSchema(
  (value: unknown): value is { n: number } =>
    typeof value === 'object' &&
    value !== null &&
    'n' in value &&
    typeof value.n === 'number',
);

const schema = numberBox;

describe('createInboundHandler function', () => {
  it(
    'answers undefined for a payload the schema refuses',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A handler that would run for any payload the schema accepts.
      const handler = createInboundHandler({
        run: async () => ({ ok: true }),
        schema,
      });

      // A payload the schema refuses yields no work, so a malformed client
      // message never reaches game logic.
      expect(handler({ n: 'x' }, 'ctx', 'handle')).toBeUndefined();
    },
  );

  it(
    'defers the call, handing it the parsed data, context and handle',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The run function records what it is handed.
      const calls: unknown[] = [];
      const handler = createInboundHandler({
        run: async (data, context, handle) => {
          calls.push([data, context, handle]);
          return { ok: true };
        },
        schema,
      });
      // A valid payload gives back a deferred task, not a result.
      const work = handler({ n: 1 }, 'ctx', 'handle');

      // Nothing has run yet: the caller decides when to start it.
      expect(calls).toStrictEqual([]);
      // Running the task returns the run function's answer.
      await expect(work?.()).resolves.toStrictEqual({ ok: true });
      // The run function got the parsed payload, the context and the connection
      // handle.
      expect(calls).toStrictEqual([[{ n: 1 }, 'ctx', 'handle']]);
    },
  );

  it(
    'reads an absent payload as {} when the message has no fields',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const handler = createInboundHandler({
        // A message such as step has no fields, so the client may omit the
        // payload.
        emptyPayloadAllowed: true,
        run: async () => ({ ok: true }),
        schema: recordSchema,
      });

      // An absent payload is read as {} and accepted rather than refused.
      expect(handler(undefined, 'ctx', 'handle')).toBeDefined();
    },
  );
});
