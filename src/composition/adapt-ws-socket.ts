import type { RegisteredWsRoute } from '@ports';
import { wsFrameToText } from './ws-frame-to-text';

/** The part of a `ws` socket the adapter uses. */
interface UpgradedSocket {
  on: {
    (
      event: 'message',
      listener: (raw: Buffer | ArrayBuffer | Buffer[]) => void,
    ): unknown;
    (event: 'close', listener: () => void): unknown;
  };
  send: (data: string) => void;
  close: (code?: number, reason?: string) => void;
}

/**
 * Present a `ws` socket as the small socket a route is written against.
 *
 * Routes register their message and close handlers after they open, so the
 * adapter keeps the handlers and the socket's events call whatever is
 * registered. A route never sees `ws`, only text frames.
 *
 * @param socket - The upgraded socket.
 * @returns The socket a registered route receives.
 */
const adaptWsSocket = (
  socket: UpgradedSocket,
): Parameters<RegisteredWsRoute['onConnection']>[1] => {
  const messageHandlers: ((raw: string) => void)[] = [];
  const closeHandlers: (() => void)[] = [];

  // Frames become text once, here, so every route parses a string.
  socket.on('message', (raw) => {
    const text = wsFrameToText(raw);
    for (const handler of messageHandlers) {
      handler(text);
    }
  });
  // A route learns of a disconnect through onClose, so the game can stop
  // sending to this socket.
  socket.on('close', () => {
    for (const handler of closeHandlers) {
      handler();
    }
  });

  return {
    close: (code, reason) => {
      socket.close(code, reason);
    },
    onClose: (handler) => {
      closeHandlers.push(handler);
    },
    onMessage: (handler) => {
      messageHandlers.push(handler);
    },
    send: (data) => {
      socket.send(data);
    },
  };
};

export type { UpgradedSocket };
export { adaptWsSocket };
