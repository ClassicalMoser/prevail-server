import { wsFrameToText } from './ws-frame-to-text';

describe('wsFrameToText function', () => {
  it('reads a single buffer', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(wsFrameToText(Buffer.from('{"type":"step"}'))).toBe(
      '{"type":"step"}',
    );
  });

  it('joins fragments in order', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      wsFrameToText([Buffer.from('{"type":'), Buffer.from('"step"}')]),
    ).toBe('{"type":"step"}');
  });

  it('reads an array buffer', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const bytes = new TextEncoder().encode('hi');

    expect(wsFrameToText(bytes.buffer)).toBe('hi');
  });
});
