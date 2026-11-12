import type { GetRouteValidators } from '@classicalmoser/prevail-contracts';
import type { WireRouteRequest } from '@ports';
import { tryParseGetRequest } from './try-parse-get-request';

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

// Stub validators: params must carry a string id; the query accepts anything.
const getValidators = {
  params: {
    safeParse: (value: unknown): ParseOutcome<{ id: string }> => {
      if (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        typeof value.id === 'string'
      ) {
        return pass({ id: value.id });
      }
      return fail;
    },
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

describe('tryParseGetRequest function', () => {
  it(
    'returns invalidParams when params fail the schema',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const parsed = tryParseGetRequest(
        // A request with no id in its params, which the stub refuses.
        wire(),
        getValidators as unknown as GetRouteValidators<
          { id: string },
          Record<string, never>,
          unknown
        >, // stub safeParse doubles; ZodType is too large to fake fully
      );

      // A bad id is a 400 'Invalid params'.
      expect(parsed).toStrictEqual({
        error: { message: 'Invalid params', status: 400, success: false },
        ok: false,
      });
    },
  );

  it(
    'returns params and headers for a valid get wire request',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const parsed = tryParseGetRequest(
        // A request for card-1 with a bearer header.
        wire({
          headers: { authorization: 'Bearer x' },
          params: { id: 'card-1' },
        }),
        getValidators as unknown as GetRouteValidators<
          { id: string },
          Record<string, never>,
          unknown
        >, // stub safeParse doubles; ZodType is too large to fake fully
      );

      // The parsed params, the empty query and the headers come back.
      expect(parsed).toStrictEqual({
        ok: true,
        value: {
          headers: { authorization: 'Bearer x' },
          params: { id: 'card-1' },
          query: {},
        },
      });
    },
  );
});
