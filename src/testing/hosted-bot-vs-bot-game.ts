import assert from 'node:assert/strict';
import type { EnginePorts } from '@classicalmoser/prevail-rules/application';
import { createGameSessionUseCases } from '@application';
import type { GameSessionRuntime } from '@application';
import { createInMemoryEnginePorts } from '@infrastructure';
import type { GameWatchConnection, GameWatchOutbound } from '@ports';
import {
  blackArmyId,
  miniArmy,
  ownedArmyStorage,
  whiteArmyId,
} from './game-session-armies';

/** Subject that creates every hosted bot-vs-bot game. */
const botVsBotCreator = 'auth0|human';

/**
 * A runtime whose engine fans appended events out, as composition wires it,
 * with a mini bot-vs-bot game already created by `botVsBotCreator`.
 *
 * @returns The runtime, its engine ports, and the new game id.
 */
const hostedBotVsBotGame = async (): Promise<{
  runtime: GameSessionRuntime;
  enginePorts: EnginePorts;
  gameId: string;
}> => {
  // The engine hook needs the runtime that does not exist until the ports do, as
  // in composition, so it reads it through a slot filled just after.
  const ref: { current?: GameSessionRuntime } = {};
  const enginePorts = createInMemoryEnginePorts({
    onEventAppended: (gameId, _round, event) => {
      ref.current?.fanoutEvent(gameId, event);
    },
  });
  const runtime = createGameSessionUseCases({
    botTurnGapMs: 0,
    enginePorts,
    ownedArmyStorage: ownedArmyStorage({
      [blackArmyId]: miniArmy(blackArmyId),
      [whiteArmyId]: miniArmy(whiteArmyId),
    }),
  });
  ref.current = runtime;
  const created = await runtime.createBotVsBotGame(botVsBotCreator, {
    blackArmyId,
    gameMode: 'mini',
    whiteArmyId,
  });
  // A game that failed to create would make every later step meaningless, so the
  // fixture fails at once.
  assert.ok(created.success);
  const hosted = { enginePorts, gameId: created.data, runtime };
  return hosted;
};

/**
 * A watcher socket that keeps what it was sent.
 *
 * @param gameId - Game it watches.
 * @param subject - Who opened it. Defaults to the creator.
 * @returns The connection and the messages it has received.
 */
const watcher = (
  gameId: string,
  subject = botVsBotCreator,
): { connection: GameWatchConnection; sent: GameWatchOutbound[] } => {
  const sent: GameWatchOutbound[] = [];
  const connection: GameWatchConnection = {
    gameId,
    send: (message) => {
      sent.push(message);
    },
    subject,
  };
  const socket = { connection, sent };
  return socket;
};

export { botVsBotCreator, hostedBotVsBotGame, watcher };
