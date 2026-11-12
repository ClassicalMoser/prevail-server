import type {
  InGameSeatContract,
  RouteAuth,
} from '@classicalmoser/prevail-contracts';
import type { FailValidationResult } from '@classicalmoser/prevail-rules/domain';
import type { RequestAuth } from './routes-port';

/** Untyped connection context from the WS adapter before contract parse. */
interface WireWsConnection {
  params: unknown;
  headers: Readonly<Record<string, string | undefined>>;
  auth?: RequestAuth;
}

/** Validated seat connection context passed to handlers. */
interface WsSeatConnectionContext<TParams extends Record<string, unknown>> {
  params: TParams;
  headers: Readonly<Record<string, string | undefined>>;
  auth: RequestAuth;
  side: 'white' | 'black';
}

/** Validated bot-vs-bot watcher context passed to handlers. It has no seat. */
interface WsWatchConnectionContext<TParams extends Record<string, unknown>> {
  params: TParams;
  headers: Readonly<Record<string, string | undefined>>;
  auth: RequestAuth;
}

/**
 * A WebSocket route ready for registration with the WS adapter.
 *
 * Built by `implementInGameSeatWs` or `implementInGameBotVsBotWs` from a
 * prevail-contracts definition.
 */
interface RegisteredWsRoute {
  path: string;
  auth: RouteAuth;
  /**
   * Called after upgrade auth + params validation.
   * Returns false to reject the connection after the socket is open.
   */
  onConnection: (
    wire: WireWsConnection,
    socket: {
      send: (data: string) => void;
      close: (code?: number, reason?: string) => void;
      onMessage: (handler: (raw: string) => void) => void;
      onClose: (handler: () => void) => void;
    },
  ) => Promise<void>;
}

/** Collection of socket routes passed to registerWs. */
type WsRouteRegistry = readonly RegisteredWsRoute[];

/** What a handler answers when a socket opens: a handle to keep, or a close. */
type WsOpenResult<THandle> =
  | { ok: true; connectionHandle: THandle }
  | { ok: false; closeCode?: number; reason: string };

/** Result of a seat message: done, or the `choiceRejected` payload to send. */
type SeatMessageResult =
  | { ok: true }
  | { ok: false; choiceRejected: FailValidationResult };

/**
 * What a seat route's handlers do for one connected seat; THandle is the
 * connection the open handler returns and the others receive back.
 */
interface InGameSeatWsHandler<
  TParams extends Record<string, unknown>,
  TInboundPlayerChoice,
  THandle = unknown,
> {
  onOpen: (
    context: WsSeatConnectionContext<TParams>,
    send: (message: unknown) => void,
  ) => Promise<WsOpenResult<THandle>>;
  onPlayerChoice: (
    context: WsSeatConnectionContext<TParams>,
    choice: TInboundPlayerChoice,
    connectionHandle: THandle,
  ) => Promise<SeatMessageResult>;
  /** Client asked for the current seat-visible game (resync). */
  onRequestGameSnapshot: (
    context: WsSeatConnectionContext<TParams>,
    connectionHandle: THandle,
  ) => Promise<SeatMessageResult>;
  onClose: (
    context: WsSeatConnectionContext<TParams>,
    connectionHandle: THandle,
  ) => void;
}

/** Result of a watcher message: done, or the `stepRejected` payload to send. */
type WatchMessageResult =
  | { ok: true }
  | { ok: false; stepRejected: FailValidationResult };

/** What the bot-vs-bot watcher route's handlers do for the creator's socket. */
interface InGameBotVsBotWsHandler<
  TParams extends Record<string, unknown>,
  THandle = unknown,
> {
  onOpen: (
    context: WsWatchConnectionContext<TParams>,
    send: (message: unknown) => void,
  ) => Promise<WsOpenResult<THandle>>;
  /** Watcher asked to play one bot choice. */
  onStep: (
    context: WsWatchConnectionContext<TParams>,
    connectionHandle: THandle,
  ) => Promise<WatchMessageResult>;
  /** Watcher asked for the current authoritative game (resync). */
  onRequestGameSnapshot: (
    context: WsWatchConnectionContext<TParams>,
    connectionHandle: THandle,
  ) => Promise<WatchMessageResult>;
  onClose: (
    context: WsWatchConnectionContext<TParams>,
    connectionHandle: THandle,
  ) => void;
}

type AnyInGameSeatContract = InGameSeatContract<
  'white' | 'black',
  Record<string, unknown>,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown
>;

export type {
  AnyInGameSeatContract,
  InGameBotVsBotWsHandler,
  InGameSeatWsHandler,
  RegisteredWsRoute,
  SeatMessageResult,
  WatchMessageResult,
  WireWsConnection,
  WsOpenResult,
  WsRouteRegistry,
  WsSeatConnectionContext,
  WsWatchConnectionContext,
};
