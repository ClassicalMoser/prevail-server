import { isDataSignature, isErrorSignature } from './is-error-signature';

describe('isErrorSignature function', () => {
  it('narrows a failed route result', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const value = {
      message: 'nope',
      status: 400,
      success: false as const,
    };

    expect(isErrorSignature(value)).toBe(true);
  });
});

describe('isDataSignature function', () => {
  it('narrows a successful result that carries data', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const value = {
      data: { id: '1' },
      success: true as const,
    };

    expect(isDataSignature(value)).toBe(true);
  });
});
