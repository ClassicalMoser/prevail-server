import { parseIfJson } from './parse-if-json';

describe('parseIfJson function', () => {
  it('parses a JSON string into the object shape', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const value = parseIfJson<{ id: string }>('{"id":"card-1"}');

    expect(value).toStrictEqual({ id: 'card-1' });
  });

  it('returns an already-parsed object unchanged', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const input = { id: 'card-1' };
    const value = parseIfJson(input);

    expect(value).toBe(input);
  });
});
