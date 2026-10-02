import type { DeleteRouteValidators } from '@classicalmoser/prevail-contracts';
import type { WireRouteRequest } from '@ports';
import { tryParseDeleteRequest } from './try-parse-delete-request';

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

const deleteValidators = {
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

describe('tryParseDeleteRequest function', () => {
  it(
    'returns params and headers for a valid delete wire request',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const parsed = tryParseDeleteRequest(
        wire({
          headers: { authorization: 'Bearer x' },
          params: { id: 'card-1' },
        }),
        deleteValidators as unknown as DeleteRouteValidators<
          { id: string },
          Record<string, never>
        >, // stub safeParse doubles; ZodType is too large to fake fully
      );

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
