import {
  emptyObjectSuccess,
  mapVoidToEmptyObject,
  mapVoidToNoContent,
  noContentSuccess,
} from './data-error-signature-port';

describe('noContentSuccess function', () => {
  it('returns a bare success with no data field', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(noContentSuccess()).toStrictEqual({ success: true });
  });
});

describe('emptyObjectSuccess function', () => {
  it(
    'returns a success envelope with an empty object',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      expect(emptyObjectSuccess()).toStrictEqual({ data: {}, success: true });
    },
  );
});

describe('mapVoidToNoContent function', () => {
  it('passes an error envelope through unchanged', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const failure = {
      message: 'nope',
      status: 404,
      success: false as const,
    };

    expect(mapVoidToNoContent(failure)).toStrictEqual(failure);
  });

  it('maps a void success to no-content', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      mapVoidToNoContent({ data: undefined, success: true }),
    ).toStrictEqual({ success: true });
  });
});

describe('mapVoidToEmptyObject function', () => {
  it(
    'maps a void success to an empty object envelope',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      expect(
        mapVoidToEmptyObject({ data: undefined, success: true }),
      ).toStrictEqual({ data: {}, success: true });
    },
  );
});
