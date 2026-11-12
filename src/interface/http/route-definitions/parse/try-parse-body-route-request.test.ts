import type { PostRouteValidators } from '@classicalmoser/prevail-contracts';
import type { WireRouteRequest } from '@ports';
import { tryParseBodyRouteRequest } from './try-parse-body-route-request';

interface ParseSuccess<T> {
  success: true;
  data: T;
}

interface ParseFailure {
  success: false;
  error: { issues: unknown[] };
}

type ParseOutcome<T> = ParseSuccess<T> | ParseFailure;

const pass = <T>(data: T): ParseSuccess<T> => ({
  success: true,
  data,
});

const fail: ParseFailure = {
  success: false,
  error: { issues: [] },
};

// Stub validators: the body must be an object with a string name; params and
// query accept anything.
const bodyValidators = {
  body: {
    safeParse: (value: unknown): ParseOutcome<{ name: string }> => {
      if (
        typeof value === 'object' &&
        value !== null &&
        'name' in value &&
        typeof value.name === 'string'
      ) {
        return pass({ name: value.name });
      }
      return fail;
    },
  },
  params: {
    safeParse: (): ParseOutcome<Record<string, never>> => pass({}),
  },
  query: {
    safeParse: (): ParseOutcome<Record<string, never>> => pass({}),
  },
  return: {
    safeParse: (value: unknown): ParseOutcome<unknown> => pass(value),
  },
};

// An empty request off the wire; each case overrides only the part it checks.
const wire = (overrides: Partial<WireRouteRequest> = {}): WireRouteRequest => ({
  body: undefined,
  headers: {},
  params: {},
  query: {},
  ...overrides,
});

describe('tryParseBodyRouteRequest function', () => {
  it(
    'returns invalidBody when the body fails the schema',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A body whose name is a number, which the stub refuses.
      const parsed = tryParseBodyRouteRequest(
        wire({ body: { name: 1 } }),
        bodyValidators as unknown as PostRouteValidators<
          Record<string, never>,
          Record<string, never>,
          { name: string },
          unknown
        >, // stub safeParse doubles; ZodType is too large to fake fully
      );

      // A bad body is a 400 'Invalid body', not an exception, so the client
      // sees what was wrong.
      expect(parsed).toStrictEqual({
        error: { message: 'Invalid body', status: 400, success: false },
        ok: false,
      });
    },
  );
});
