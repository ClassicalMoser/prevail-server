import assert from 'node:assert/strict';
import type { EnginePorts } from '@classicalmoser/prevail-rules/application';
import { createBotVsBotGame } from '@application';
import type { GameSessionStore } from '@application';
import type { GameWatchConnection, GameWatchOutbound } from '@ports';
import { blackArmyId, miniArmy, whiteArmyId } from './game-session-armies';
import { liveGameStore } from './live-game-store';

/** Subject that creates every hosted bot-vs-bot game. */
const botVsBotCreator = 'auth0|human';

/**
 * A live-game store with a mini bot-vs-bot game already created by
 * `botVsBotCreator`. Appended events fan out to watchers, as composition wires it.
 *
 * @returns The store, its engine ports, and the new game id.
 */
const hostedBotVsBotGame = async (): Promise<{
  store: GameSessionStore;
  enginePorts: EnginePorts;
  gameId: string;
}> => {
  const { store, enginePorts } = liveGameStore({
    [blackArmyId]: miniArmy(blackArmyId),
    [whiteArmyId]: miniArmy(whiteArmyId),
  });
  const created = await createBotVsBotGame(store, botVsBotCreator, {
    blackArmyId,
    gameMode: 'mini',
    whiteArmyId,
  });
  // A game that failed to create would make every later step meaningless, so the
  // fixture fails at once.
  assert.ok(created.success);
  const hosted = { enginePorts, gameId: created.data, store };
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
