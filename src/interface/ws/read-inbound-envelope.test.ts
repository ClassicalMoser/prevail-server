import { readInboundEnvelope } from './read-inbound-envelope';

describe('readInboundEnvelope function', () => {
  it('splits a tagged message into type and payload', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Every client frame is JSON with a type and a payload.
    const envelope = readInboundEnvelope('{"type":"step","payload":{}}');

    expect(envelope).toStrictEqual({ ok: true, payload: {}, type: 'step' });
  });

  it('refuses text that is not JSON', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Text that is not JSON.
    const envelope = readInboundEnvelope('not-json');

    // The reason says the JSON is invalid.
    expect(envelope).toStrictEqual({ errorReason: 'Invalid JSON', ok: false });
  });

  it('refuses JSON without a string type', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Valid JSON, but an array with no type string.
    const envelope = readInboundEnvelope('[1, 2]');

    // The reason says the message is invalid, distinct from the invalid JSON
    // case.
    expect(envelope).toStrictEqual({
      errorReason: 'Invalid inbound message',
      ok: false,
    });
  });
});
