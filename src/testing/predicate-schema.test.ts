import { predicateSchema } from './predicate-schema';

const isString = (value: unknown): value is string => typeof value === 'string';

describe('predicateSchema function', () => {
  it('parses a value the check accepts', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(predicateSchema(isString).safeParse('a')).toStrictEqual({
      data: 'a',
      success: true,
    });
  });

  it('refuses a value the check rejects', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(predicateSchema(isString).safeParse(1)).toStrictEqual({
      success: false,
    });
  });
});
