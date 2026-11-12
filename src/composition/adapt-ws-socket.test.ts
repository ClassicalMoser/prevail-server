import { adaptWsSocket } from './adapt-ws-socket';
import type { UpgradedSocket } from './adapt-ws-socket';

/** A socket standing in for `ws`: tests fire its events and read what it sent. */
const fakeUpgradedSocket = (): {
  socket: UpgradedSocket;
  fireMessage: (raw: Buffer) => void;
  fireClose: () => void;
  sent: string[];
  closed: unknown[];
} => {
  // The fake keeps the listeners adaptWsSocket registers, so a test can fire a
  // frame or a close by hand.
  const handlers: {
    message: ((raw: Buffer | ArrayBuffer | Buffer[]) => void)[];
    close: (() => void)[];
  } = { close: [], message: [] };
  const sent: string[] = [];
  const closed: unknown[] = [];
  const on = ((event: 'message' | 'close', listener: () => void): void => {
    handlers[event].push(listener);
  }) as UpgradedSocket['on']; // one function answers both event overloads
  // send and close only record their arguments: the adapter must pass them
  // straight through.
  const socket: UpgradedSocket = {
    close: (code, reason) => closed.push([code, reason]),
    on,
    send: (data) => sent.push(data),
  };
  return {
    closed,
    fireClose: () => handlers.close.forEach((handler) => handler()),
    fireMessage: (raw) => handlers.message.forEach((handler) => handler(raw)),
    sent,
    socket,
  };
};

describe('adaptWsSocket function', () => {
  it(
    'hands a registered message handler the frame as text',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // One handler is registered, then one frame is fired as raw bytes.
      const { socket, fireMessage } = fakeUpgradedSocket();
      const received: string[] = [];
      adaptWsSocket(socket).onMessage((text) => received.push(text));
      fireMessage(Buffer.from('hello'));

      // The handler gets the frame's text, not a Buffer, so route code never
      // handles raw bytes.
      expect(received).toStrictEqual(['hello']);
    },
  );

  it(
    'calls a registered close handler when the socket closes',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // One close handler is registered, then the socket closes.
      const { socket, fireClose } = fakeUpgradedSocket();
      const closedFor: string[] = [];
      adaptWsSocket(socket).onClose(() => closedFor.push('left'));
      fireClose();

      // The seat or watcher is told the connection is gone.
      expect(closedFor).toStrictEqual(['left']);
    },
  );

  it('writes and closes through the socket', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const { socket, sent, closed } = fakeUpgradedSocket();
    const adapted = adaptWsSocket(socket);
    adapted.send('{}');
    // 1008 is the policy-violation close code the server uses for refused
    // connections.
    adapted.close(1008, 'Unauthorized');

    // The text reaches the socket unchanged.
    expect(sent).toStrictEqual(['{}']);
    // The close code and reason reach the socket unchanged.
    expect(closed).toStrictEqual([[1008, 'Unauthorized']]);
  });
});
