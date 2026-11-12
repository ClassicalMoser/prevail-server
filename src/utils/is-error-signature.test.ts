import { isDataSignature, isErrorSignature } from './is-error-signature';

describe('isErrorSignature function', () => {
  it('narrows a failed route result', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A failure envelope: success false with a message and status.
    const value = {
      message: 'nope',
      status: 400,
      success: false as const,
    };

    // The guard recognises it, so route code can branch on failure.
    expect(isErrorSignature(value)).toBe(true);
  });
});

describe('isDataSignature function', () => {
  it('narrows a successful result that carries data', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A success envelope carrying data.
    const value = {
      data: { id: '1' },
      success: true as const,
    };

    // The guard recognises it as success with data, as against a success with
    // none.
    expect(isDataSignature(value)).toBe(true);
  });
});
