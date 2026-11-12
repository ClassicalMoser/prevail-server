import {
  emptyObjectSuccess,
  mapVoidToEmptyObject,
  mapVoidToNoContent,
  noContentSuccess,
} from './data-error-signature-port';

describe('noContentSuccess function', () => {
  it('returns a bare success with no data field', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A 204 route has nothing to send, so its success carries no data field at
    // all.
    expect(noContentSuccess()).toStrictEqual({ success: true });
  });
});

describe('emptyObjectSuccess function', () => {
  it(
    'returns a success envelope with an empty object',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A route that must still return JSON answers with an empty object.
      expect(emptyObjectSuccess()).toStrictEqual({ data: {}, success: true });
    },
  );
});

describe('mapVoidToNoContent function', () => {
  it('passes an error envelope through unchanged', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A 404 failure envelope.
    const failure = {
      message: 'nope',
      status: 404,
      success: false as const,
    };

    // A failure keeps its status and message when a void result is mapped: only
    // success changes shape.
    expect(mapVoidToNoContent(failure)).toStrictEqual(failure);
  });

  it('maps a void success to no-content', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      // A void success from storage becomes a success with no body.
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
        // The same void success becomes an empty object, for routes whose
        // client expects JSON.
        mapVoidToEmptyObject({ data: undefined, success: true }),
      ).toStrictEqual({ data: {}, success: true });
    },
  );
});
