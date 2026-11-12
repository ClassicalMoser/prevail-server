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
  const handlers: {
    message: ((raw: Buffer | ArrayBuffer | Buffer[]) => void)[];
    close: (() => void)[];
  } = { close: [], message: [] };
  const sent: string[] = [];
  const closed: unknown[] = [];
  const on = ((event: 'message' | 'close', listener: () => void): void => {
    handlers[event].push(listener);
  }) as UpgradedSocket['on']; // one function answers both event overloads
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

      const { socket, fireMessage } = fakeUpgradedSocket();
      const received: string[] = [];
      adaptWsSocket(socket).onMessage((text) => received.push(text));
      fireMessage(Buffer.from('hello'));

      expect(received).toStrictEqual(['hello']);
    },
  );

  it(
    'calls a registered close handler when the socket closes',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const { socket, fireClose } = fakeUpgradedSocket();
      const closedFor: string[] = [];
      adaptWsSocket(socket).onClose(() => closedFor.push('left'));
      fireClose();

      expect(closedFor).toStrictEqual(['left']);
    },
  );

  it('writes and closes through the socket', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const { socket, sent, closed } = fakeUpgradedSocket();
    const adapted = adaptWsSocket(socket);
    adapted.send('{}');
    adapted.close(1008, 'Unauthorized');

    expect(sent).toStrictEqual(['{}']);
    expect(closed).toStrictEqual([[1008, 'Unauthorized']]);
  });
});
