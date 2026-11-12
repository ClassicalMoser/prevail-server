import { fail, ok, okVoid } from './port-response';

describe('ok function', () => {
  it('wraps data in a successful port response', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A success response carries the data under result: true.
    const response = ok({ id: 'game-1' });

    expect(response).toStrictEqual({ data: { id: 'game-1' }, result: true });
  });
});

describe('okVoid function', () => {
  it('returns a successful void port response', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A success with nothing to return still reports result: true.
    const response = okVoid();

    expect(response).toStrictEqual({ data: undefined, result: true });
  });
});

describe('fail function', () => {
  it('wraps the reason in a failed port response', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A failure carries its reason and result: false, so callers branch on
    // result.
    const response = fail('missing game');

    expect(response).toStrictEqual({
      errorReason: 'missing game',
      result: false,
    });
  });
});
