import { predicateSchema } from './predicate-schema';

// A type guard standing for a domain check.
const isString = (value: unknown): value is string => typeof value === 'string';

describe('predicateSchema function', () => {
  it('parses a value the check accepts', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A value the check accepts parses to itself.
    expect(predicateSchema(isString).safeParse('a')).toStrictEqual({
      data: 'a',
      success: true,
    });
  });

  it('refuses a value the check rejects', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A value the check rejects fails, so the schema behaves like the guard it
    // wraps.
    expect(predicateSchema(isString).safeParse(1)).toStrictEqual({
      success: false,
    });
  });
});
