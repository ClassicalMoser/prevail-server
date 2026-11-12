import { gameIdParamsSchema } from '@testing';
import { findAdmittedConnection } from './find-admitted-connection';
import type { WsSocket } from './ws-types';

const paramsSchema = gameIdParamsSchema;

/** A socket that records its close, and nothing else. */
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

      expect(admitted).toStrictEqual({
        auth: { subject: 'auth0|a' },
        params: { gameId: 'g' },
      });
      expect(closed).toStrictEqual([]);
    },
  );

  it('closes with 1008 when the params are invalid', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const { socket, closed } = closingSocket();
    const admitted = findAdmittedConnection({
      paramsSchema,
      socket,
      wire: { auth: { subject: 'auth0|a' }, headers: {}, params: {} },
    });

    expect(admitted).toBeUndefined();
    expect(closed).toStrictEqual([[1008, 'Invalid params']]);
  });

  it('closes with 1008 when nobody is authenticated', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const { socket, closed } = closingSocket();
    const admitted = findAdmittedConnection({
      paramsSchema,
      socket,
      wire: { headers: {}, params: { gameId: 'g' } },
    });

    expect(admitted).toBeUndefined();
    expect(closed).toStrictEqual([[1008, 'Unauthorized']]);
  });
});
