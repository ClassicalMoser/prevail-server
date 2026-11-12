import type { WireWsConnection } from '@ports';
import type { AdmittedConnection, WsSocket } from './ws-types';

/** The part of a Zod schema this check needs: parse without throwing. */
interface ParamsSchema<TParams> {
  safeParse: (
    value: unknown,
  ) => { success: true; data: TParams } | { success: false };
}

/**
 * Admit a connecting client, or close its socket and answer `undefined`.
 *
 * A client is admitted only with params the contract accepts and an
 * authenticated subject. Anything else is closed with 1008 (policy violation)
 * before any game is touched.
 *
 * @param input - What the client sent, its socket, and the contract's params schema.
 * @returns The parsed params and auth, or `undefined` once the socket is closed.
 */
const findAdmittedConnection = <TParams>(input: {
  wire: WireWsConnection;
  socket: WsSocket;
  paramsSchema: ParamsSchema<TParams>;
}): AdmittedConnection<TParams> | undefined => {
  // The path params (such as the game id) come from the URL and are client
  // input; a malformed one never reaches the session.
  const parsed = input.paramsSchema.safeParse(input.wire.params);
  if (!parsed.success) {
    input.socket.close(1008, 'Invalid params');
    return undefined;
  }
  // Composition authenticates before the route runs; a missing subject here
  // means the route was mounted without auth, so nobody may play.
  if (input.wire.auth === undefined) {
    input.socket.close(1008, 'Unauthorized');
    return undefined;
  }
  const admitted: AdmittedConnection<TParams> = {
    auth: input.wire.auth,
    params: parsed.data,
  };
  return admitted;
};

export type { ParamsSchema };
export { findAdmittedConnection };
