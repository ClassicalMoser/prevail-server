import type { RegisteredWsRoute, RequestAuth } from '@ports';
import type { FailValidationResult } from '@classicalmoser/prevail-rules/domain';

/** Writes one JSON message to the connected socket. */
type SendJson = (message: unknown) => void;

/** The socket a route is handed when a client connects. */
type WsSocket = Parameters<RegisteredWsRoute['onConnection']>[1];

/** What a handler answers after a client message: done, or why it was refused. */
type WsOutcome = { ok: true } | { ok: false; rejection: FailValidationResult };

/** The message type that tells a client its message did nothing. */
type RejectionType = 'choiceRejected' | 'stepRejected';

/** A connection that passed its params and auth checks. */
interface AdmittedConnection<TParams> {
  /** The URL params the contract accepted, such as the game id. */
  params: TParams;
  /** The verified caller; the only source of the subject a use case acts for. */
  auth: RequestAuth;
}

export type {
  AdmittedConnection,
  RejectionType,
  SendJson,
  WsOutcome,
  WsSocket,
};
