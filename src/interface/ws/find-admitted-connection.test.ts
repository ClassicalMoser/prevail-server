import { gameIdParamsSchema } from '@testing';
import { findAdmittedConnection } from './find-admitted-connection';
import type { WsSocket } from './ws-types';

// The route's params must be a game id.
const paramsSchema = gameIdParamsSchema;

/** A socket that records its close, and nothing else. */
// A socket that only records its close; this function never sends or listens.
const closingSocket = (): { socket: WsSocket; closed: unknown[] } => {
  const closed: unknown[] = [];
  const socket: WsSocket = {
    close: (code, reason) => closed.push([code, reason]),
    onClose: () => {
      /* Unused by this test. */
    },
    onMessage: () => {
      /* Unused by this test. */
    },
    send: () => {
      /* Unused by this test. */
    },
  };
  return { closed, socket };
};

describe('findAdmittedConnection function', () => {
  it(
    'admits a client with valid params and a subject',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A client with a valid game id and an authenticated subject.
      const { socket, closed } = closingSocket();
      const admitted = findAdmittedConnection({
        paramsSchema,
        socket,
        wire: {
          auth: { subject: 'auth0|a' },
          headers: {},
          params: { gameId: 'g' },
        },
      });

      // Both the subject and the parsed params come through.
      expect(admitted).toStrictEqual({
        auth: { subject: 'auth0|a' },
        params: { gameId: 'g' },
      });
      // The socket stays open.
      expect(closed).toStrictEqual([]);
    },
  );

  it('closes with 1008 when the params are invalid', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const { socket, closed } = closingSocket();
    const admitted = findAdmittedConnection({
      paramsSchema,
      socket,
      // An authenticated client with no game id.
      wire: { auth: { subject: 'auth0|a' }, headers: {}, params: {} },
    });

    expect(admitted).toBeUndefined();
    // 1008 is the policy-violation close code; the reason says why.
    expect(closed).toStrictEqual([[1008, 'Invalid params']]);
  });

  it('closes with 1008 when nobody is authenticated', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const { socket, closed } = closingSocket();
    const admitted = findAdmittedConnection({
      paramsSchema,
      socket,
      // A valid game id but no auth on the wire.
      wire: { headers: {}, params: { gameId: 'g' } },
    });

    expect(admitted).toBeUndefined();
    // An unauthenticated client is closed with 1008, not admitted as a guest.
    expect(closed).toStrictEqual([[1008, 'Unauthorized']]);
  });
});
