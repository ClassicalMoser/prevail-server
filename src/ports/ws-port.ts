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

/**
 * A WebSocket route ready for registration with the WS adapter.
 *
 * Built by `implementInGameSeatWs` from a prevail-contracts seat definition.
 */
interface RegisteredWsRoute {
  path: string;
  side: 'white' | 'black';
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

type WsRouteRegistry = readonly RegisteredWsRoute[];

interface InGameSeatWsHandler<
  TParams extends Record<string, unknown>,
  TInboundPlayerChoice,
> {
  onOpen: (
    context: WsSeatConnectionContext<TParams>,
    send: (message: unknown) => void,
  ) => Promise<
    | { ok: true; connectionHandle: unknown }
    | { ok: false; closeCode?: number; reason: string }
  >;
  onPlayerChoice: (
    context: WsSeatConnectionContext<TParams>,
    choice: TInboundPlayerChoice,
    connectionHandle: unknown,
  ) => Promise<
    { ok: true } | { ok: false; choiceRejected: FailValidationResult }
  >;
  /** Client asked for the current seat-visible game (resync). */
  onRequestGameSnapshot: (
    context: WsSeatConnectionContext<TParams>,
    connectionHandle: unknown,
  ) => Promise<
    { ok: true } | { ok: false; choiceRejected: FailValidationResult }
  >;
  onClose: (
    context: WsSeatConnectionContext<TParams>,
    connectionHandle: unknown,
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
  InGameSeatWsHandler,
  RegisteredWsRoute,
  WireWsConnection,
  WsRouteRegistry,
  WsSeatConnectionContext,
};
