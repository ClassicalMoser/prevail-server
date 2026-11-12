import { readInboundEnvelope } from './read-inbound-envelope';

describe('readInboundEnvelope function', () => {
  it('splits a tagged message into type and payload', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const envelope = readInboundEnvelope('{"type":"step","payload":{}}');

    expect(envelope).toStrictEqual({ ok: true, payload: {}, type: 'step' });
  });

  it('refuses text that is not JSON', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const envelope = readInboundEnvelope('not-json');

    expect(envelope).toStrictEqual({ errorReason: 'Invalid JSON', ok: false });
  });

  it('refuses JSON without a string type', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const envelope = readInboundEnvelope('[1, 2]');

    expect(envelope).toStrictEqual({
      errorReason: 'Invalid inbound message',
      ok: false,
    });
  });
});
