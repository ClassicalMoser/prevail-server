import type {
  LoggerPort,
  RegisteredWsRoute,
  RequestAuth,
  WireWsConnection,
  WsOpenResult,
} from '@ports';
import type { RouteAuth } from '@classicalmoser/prevail-contracts';
import type { InboundHandler } from './create-inbound-handler';
import type { ParamsSchema } from './find-admitted-connection';
import { findAdmittedConnection } from './find-admitted-connection';
import { openWsConnection } from './open-ws-connection';
import { routeWsMessage } from './route-ws-message';
import type { RejectionType, SendJson, WsSocket } from './ws-types';

/**
 * Build one mountable WebSocket route.
 *
 * The seat route and the bot-vs-bot watcher route differ only in the context
 * their handlers see, the messages they take, and the rejection a client is
 * sent. This holds the rest: admit the client, open it, route its messages,
 * and tell the game when it leaves.
 *
 * @param input - The contract's path, auth and params schema, plus the route's handlers.
 * @returns A route the composition root can mount.
 */
const implementWsRoute = <TParams, TContext, THandle>(input: {
  path: string;
  auth: RouteAuth;
  paramsSchema: ParamsSchema<TParams>;
  rejectedType: RejectionType;
  logger: LoggerPort;
  /** Builds what this route's handlers see about the connected client. */
  buildContext: (
    admitted: { params: TParams; auth: RequestAuth },
    wire: WireWsConnection,
  ) => TContext;
  open: (
    context: TContext,
    sendJson: SendJson,
  ) => Promise<WsOpenResult<THandle>>;
  close: (context: TContext, connectionHandle: THandle) => void;
  inbound: ReadonlyMap<string, InboundHandler<TContext, THandle>>;
}): RegisteredWsRoute => {
  const onConnection = async (
    wire: WireWsConnection,
    socket: WsSocket,
  ): Promise<void> => {
    const admitted = findAdmittedConnection({
      paramsSchema: input.paramsSchema,
      socket,
      wire,
    });
    if (admitted === undefined) {
      return;
    }

    const context = input.buildContext(admitted, wire);
    const sendJson: SendJson = (message) => {
      socket.send(JSON.stringify(message));
    };

    // Opening registers the client with the game and may send its first snapshot.
    const opened = await openWsConnection({
      logger: input.logger,
      open: () => input.open(context, sendJson),
      path: input.path,
    });
    if (!opened.ok) {
      socket.close(opened.closeCode ?? 1008, opened.reason);
      return;
    }
    const { connectionHandle } = opened;

    socket.onMessage((raw) => {
      routeWsMessage({
        connectionHandle,
        context,
        inbound: input.inbound,
        logger: input.logger,
        path: input.path,
        raw,
        rejectedType: input.rejectedType,
        sendJson,
      });
    });

    // A closed socket must leave the game's fan-out set.
    socket.onClose(() => {
      input.close(context, connectionHandle);
    });
  };

  const route: RegisteredWsRoute = {
    auth: input.auth,
    onConnection,
    path: input.path,
  };
  return route;
};

export { implementWsRoute };
