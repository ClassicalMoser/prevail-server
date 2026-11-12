import { predicateSchema, recordSchema } from '@testing';
import { createInboundHandler } from './create-inbound-handler';

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

      const handler = createInboundHandler({
        run: async () => ({ ok: true }),
        schema,
      });

      expect(handler({ n: 'x' }, 'ctx', 'handle')).toBeUndefined();
    },
  );

  it(
    'defers the call, handing it the parsed data, context and handle',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const calls: unknown[] = [];
      const handler = createInboundHandler({
        run: async (data, context, handle) => {
          calls.push([data, context, handle]);
          return { ok: true };
        },
        schema,
      });
      const work = handler({ n: 1 }, 'ctx', 'handle');

      expect(calls).toStrictEqual([]);
      await expect(work?.()).resolves.toStrictEqual({ ok: true });
      expect(calls).toStrictEqual([[{ n: 1 }, 'ctx', 'handle']]);
    },
  );

  it(
    'reads an absent payload as {} when the message has no fields',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const handler = createInboundHandler({
        emptyPayloadAllowed: true,
        run: async () => ({ ok: true }),
        schema: recordSchema,
      });

      expect(handler(undefined, 'ctx', 'handle')).toBeDefined();
    },
  );
});
