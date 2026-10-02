import type { GetRouteValidators } from '@classicalmoser/prevail-contracts';
import type { WireRouteRequest } from '@ports';
import { tryParseParamsQuery } from './try-parse-params-query';

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

const validators = {
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
};

const wire = (overrides: Partial<WireRouteRequest> = {}): WireRouteRequest => ({
  body: undefined,
  headers: {},
  params: {},
  query: {},
  ...overrides,
});

describe('tryParseParamsQuery function', () => {
  it(
    'returns invalidParams when params fail the schema',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const parsed = tryParseParamsQuery(
        wire(),
        validators as unknown as Pick<
          GetRouteValidators<{ id: string }, Record<string, never>, unknown>,
          'params' | 'query'
        >, // stub safeParse doubles; ZodType is too large to fake fully
      );

      expect(parsed).toStrictEqual({
        error: { message: 'Invalid params', status: 400, success: false },
        ok: false,
      });
    },
  );
});
