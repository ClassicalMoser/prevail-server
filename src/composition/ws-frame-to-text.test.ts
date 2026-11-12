import { wsFrameToText } from './ws-frame-to-text';

describe('wsFrameToText function', () => {
  it('reads a single buffer', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // One frame arrives as one buffer.
    expect(wsFrameToText(Buffer.from('{"type":"step"}'))).toBe(
      '{"type":"step"}',
    );
  });

  it('joins fragments in order', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      // A large message arrives in fragments; they are joined in order before
      // parsing.
      wsFrameToText([Buffer.from('{"type":'), Buffer.from('"step"}')]),
    ).toBe('{"type":"step"}');
  });

  it('reads an array buffer', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // The browser's binary type is an ArrayBuffer.
    const bytes = new TextEncoder().encode('hi');

    // The bytes are decoded as text.
    expect(wsFrameToText(bytes.buffer)).toBe('hi');
  });
});
