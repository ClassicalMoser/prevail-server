import { createGameRunner } from '@classicalmoser/prevail-rules/application';
import type { EnginePorts } from '@classicalmoser/prevail-rules/application';
import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
import {
  createInitialGameState,
  getExpectedEvent,
  getLegalPlayerChoiceOptions,
  projectEventForVisibility,
  projectGameForVisibility,
} from '@classicalmoser/prevail-rules/domain';
import type {
  Event,
  GameForVisibility,
  GameModeName,
  GameState,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type {
  DataErrorSignature,
  GameSeatConnection,
  GameSessionOutbound,
  GameSessionUseCasesPort,
  OwnedArmyStorage,
} from '@ports';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { selectRandomPlayerChoice } from './select-random-player-choice';

/** Seat-auth identity for the bot (WS subject check). Not a Game player id. */
const BOT_SUBJECT = 'bot:prevail';
/**
 * Wire `Game.whitePlayer` / `Game.blackPlayer` id for the bot seat.
 * Client seat contracts parse these with `z.uuid()`.
 */
const BOT_PLAYER_ID = '00000000-0000-4000-8000-0000000000b0';
const VS_BOT_GAME_MODE = 'mini' as const satisfies GameModeName;
/** Pace consecutive bot submissions so the human can follow along. */
const DEFAULT_BOT_TURN_GAP_MS = 1000;

interface GameSessionMeta {
  gameMode: GameModeName;
  humanSide: PlayerSide;
  humanSubject: string;
}

interface GameSessionUseCasesDeps {
  enginePorts: EnginePorts;
  ownedArmyStorage: OwnedArmyStorage;
  /** Gap between consecutive bot submits. Defaults to 1s; use `0` in tests. */
  botTurnGapMs?: number;
}

/** Session API plus fanout hooks for engine port wiring. */
interface GameSessionRuntime extends GameSessionUseCasesPort {
  fanoutEvent: (gameId: string, event: Event) => void;
  fanoutRoundSnapshot: (
    gameId: string,
    roundNumber: number,
    gameState: GameState,
  ) => Promise<void>;
}

const otherSide = (side: PlayerSide): PlayerSide =>
  side === 'white' ? 'black' : 'white';

const sendGameSnapshotToConnection = (
  connection: GameSeatConnection,
  authoritative: GameForVisibility<'authoritative'>,
): void => {
  const visibility = connection.side === 'white' ? 'whiteSeen' : 'blackSeen';
  connection.send({
    payload: projectGameForVisibility(authoritative, visibility),
    type: 'gameSnapshot',
  });
};

const createGameSessionUseCases = (
  deps: GameSessionUseCasesDeps,
): GameSessionRuntime => {
  const metaByGameId = new Map<string, GameSessionMeta>();
  const connections = new Map<string, Set<GameSeatConnection>>();
  const submitQueues = new Map<string, Promise<unknown>>();
  const runner = createGameRunner(deps.enginePorts);

  const getConnections = (gameId: string): Set<GameSeatConnection> => {
    let set = connections.get(gameId);
    if (set === undefined) {
      set = new Set();
      connections.set(gameId, set);
    }
    return set;
  };

  const sendToSeat = (
    gameId: string,
    side: PlayerSide,
    message: GameSessionOutbound,
  ): void => {
    for (const connection of getConnections(gameId)) {
      if (connection.side === side) {
        connection.send(message);
      }
    }
  };

  const fanoutEvent = (gameId: string, event: Event): void => {
    for (const side of ['white', 'black'] as const) {
      const projected = projectEventForVisibility(event, side);
      if (projected.eventType === 'playerChoice') {
        sendToSeat(gameId, side, {
          payload: projected,
          type: 'playerChoice',
        });
      } else {
        sendToSeat(gameId, side, {
          payload: projected,
          type: 'gameEffect',
        });
      }
    }
  };

  const loadAuthoritativeGame = async (
    gameId: string,
    gameMode: GameModeName,
  ): Promise<GameForVisibility<'authoritative'> | undefined> => {
    const gameResult = await deps.enginePorts.gameStorage.getGame(
      gameId,
      gameMode,
    );
    if (gameResult === undefined || !gameResult.result) {
      return undefined;
    }
    return gameResult.data as GameForVisibility<'authoritative'>;
  };

  const fanoutRoundSnapshot = async (
    gameId: string,
    _roundNumber: number,
    _gameState: GameState,
  ): Promise<void> => {
    const meta = metaByGameId.get(gameId);
    if (meta === undefined) {
      return;
    }
    const authoritative = await loadAuthoritativeGame(gameId, meta.gameMode);
    if (authoritative === undefined) {
      return;
    }
    for (const side of ['white', 'black'] as const) {
      const visibility = side === 'white' ? 'whiteSeen' : 'blackSeen';
      sendToSeat(gameId, side, {
        payload: projectGameForVisibility(authoritative, visibility),
        type: 'gameSnapshot',
      });
    }
  };

  const enqueue = async <T>(
    gameId: string,
    work: () => Promise<T>,
  ): Promise<T> => {
    const previous = submitQueues.get(gameId) ?? Promise.resolve();
    const run = (async (): Promise<T> => {
      try {
        await previous;
      } catch {
        // Keep the per-game queue moving after a prior failure.
      }
      return work();
    })();
    submitQueues.set(gameId, run);
    return run;
  };

  const loadAuthoritativeState = async (
    gameId: string,
    gameMode: GameModeName,
  ): Promise<GameState | undefined> => {
    const authoritative = await loadAuthoritativeGame(gameId, gameMode);
    return authoritative?.gameState;
  };

  const botTurnGapMs = deps.botTurnGapMs ?? DEFAULT_BOT_TURN_GAP_MS;

  /**
   * While the next expected choice belongs to the bot (or bothPlayers with a
   * bot sample available), submit a random legal choice, pausing between
   * consecutive submits so play stays watchable.
   */
  const takeBotTurns = async (gameId: string): Promise<void> => {
    const meta = metaByGameId.get(gameId);
    if (meta === undefined) {
      return;
    }
    const botSide = otherSide(meta.humanSide);
    let submittedPriorTurn = false;

    for (;;) {
      const state = await loadAuthoritativeState(gameId, meta.gameMode);
      if (state === undefined) {
        return;
      }
      // `winner` is set by the terminal `gameOver` effect (including draws).
      if (state.winner !== undefined) {
        return;
      }

      const options = getLegalPlayerChoiceOptions(state);
      if (options === null) {
        // Player-choice router returns null for game effects *or* when
        // getExpectedEvent throws. Only drain effects when one is expected.
        let expected: ReturnType<typeof getExpectedEvent> | undefined =
          undefined;
        try {
          expected = getExpectedEvent(state);
        } catch (error) {
          console.error('takeBotTurns: getExpectedEvent failed', {
            error,
            gameId,
          });
          return;
        }
        if (expected.actionType !== 'gameEffect') {
          return;
        }
        const advanced = await runner.advanceUntilPlayerChoice(
          gameId,
          meta.gameMode,
        );
        if (!advanced.result) {
          return;
        }
      } else if (options.playerSource === meta.humanSide) {
        return;
      } else {
        const choice = selectRandomPlayerChoice({
          actingPlayer: botSide,
          options,
          state,
        });
        if (choice === undefined) {
          console.error('takeBotTurns: no bot choice for', {
            choiceType: options.choiceType,
            gameId,
            playerSource: options.playerSource,
          });
          return;
        }

        if (submittedPriorTurn && botTurnGapMs > 0) {
          await delay(botTurnGapMs);
        }

        const result = await runner.handlePlayerChoiceSubmission(
          gameId,
          meta.gameMode,
          choice,
        );
        if (!result.result) {
          return;
        }
        submittedPriorTurn = true;
      }
    }
  };

  const createVsBotGame = async (
    subject: string,
    body: CreateVsBotGameBody,
  ): Promise<DataErrorSignature<string>> => {
    const humanArmyId =
      body.humanSide === 'white' ? body.whiteArmyId : body.blackArmyId;
    const botArmyId =
      body.humanSide === 'white' ? body.blackArmyId : body.whiteArmyId;

    const humanArmy = await deps.ownedArmyStorage.getOwnedArmyById(
      subject,
      humanArmyId,
    );
    if (!humanArmy.success) {
      return humanArmy;
    }

    const botArmy = await deps.ownedArmyStorage.getOwnedArmyById(
      subject,
      botArmyId,
    );
    if (!botArmy.success) {
      return {
        message: 'Bot army must be an army owned by the creating player',
        status: botArmy.status === 404 ? 400 : botArmy.status,
        success: false,
      };
    }

    const whiteArmy =
      body.humanSide === 'white' ? humanArmy.data : botArmy.data;
    const blackArmy =
      body.humanSide === 'black' ? humanArmy.data : botArmy.data;

    const gameId = randomUUID();
    // Auth0 `sub` is not a UUID; keep it in session meta for seat auth and put
    // schema-valid UUIDs on the Game player fields the client parses.
    const humanPlayerId = randomUUID();
    const whitePlayerId =
      body.humanSide === 'white' ? humanPlayerId : BOT_PLAYER_ID;
    const blackPlayerId =
      body.humanSide === 'black' ? humanPlayerId : BOT_PLAYER_ID;
    const gameState = createInitialGameState({
      blackArmy,
      gameMode: VS_BOT_GAME_MODE,
      whiteArmy,
    });
    const game: GameForVisibility<'authoritative'> = {
      blackArmy,
      blackPlayer: blackPlayerId,
      gameMode: VS_BOT_GAME_MODE,
      gameState: gameState as GameForVisibility<'authoritative'>['gameState'],
      id: gameId,
      whiteArmy,
      whitePlayer: whitePlayerId,
    };

    const saveResult = await deps.enginePorts.gameStorage.saveNewGame(game);
    if (!saveResult.result) {
      return {
        message: saveResult.errorReason,
        status: 500,
        success: false,
      };
    }

    // processEvent appends with `gameState.currentRoundNumber` (0 during
    // pre-round setup), not `currentRoundState.roundNumber` (1).
    const streamResult =
      await deps.enginePorts.eventStreamStorage.newEventStream(
        gameId,
        game.gameState.currentRoundNumber,
      );
    if (!streamResult.result) {
      return {
        message: streamResult.errorReason,
        status: 500,
        success: false,
      };
    }

    metaByGameId.set(gameId, {
      gameMode: VS_BOT_GAME_MODE,
      humanSide: body.humanSide,
      humanSubject: subject,
    });

    await enqueue(gameId, async () => {
      await takeBotTurns(gameId);
    });

    return { data: gameId, success: true };
  };

  const submitPlayerChoice = async (input: {
    gameId: string;
    side: PlayerSide;
    subject: string;
    playerChoice: PlayerChoiceEvent;
  }): Promise<DataErrorSignature<void>> =>
    enqueue(input.gameId, async () => {
      const meta = metaByGameId.get(input.gameId);
      if (meta === undefined) {
        return { message: 'Game not found', status: 404, success: false };
      }

      const expectedSubject =
        input.side === meta.humanSide ? meta.humanSubject : BOT_SUBJECT;
      if (input.subject !== expectedSubject) {
        return {
          message: 'Seat not assigned to this player',
          status: 403,
          success: false,
        };
      }

      if (input.playerChoice.player !== input.side) {
        return {
          message: 'Player choice side does not match seat',
          status: 400,
          success: false,
        };
      }

      const result = await runner.handlePlayerChoiceSubmission(
        input.gameId,
        meta.gameMode,
        input.playerChoice,
      );

      if (!result.result) {
        return {
          message: result.errorReason,
          status: 400,
          success: false,
        };
      }

      if (input.side === meta.humanSide) {
        await takeBotTurns(input.gameId);
      }

      return { data: undefined, success: true };
    });

  const registerSeatConnection = async (
    connection: GameSeatConnection,
  ): Promise<DataErrorSignature<void>> => {
    const meta = metaByGameId.get(connection.gameId);
    if (meta === undefined) {
      return { message: 'Game not found', status: 404, success: false };
    }
    const expectedSubject =
      connection.side === meta.humanSide ? meta.humanSubject : BOT_SUBJECT;
    if (connection.subject !== expectedSubject) {
      return {
        message: 'Seat not assigned to this player',
        status: 403,
        success: false,
      };
    }

    // Serialize with submit/create bot work, and keep the seat out of fanout
    // until after resume so the open gameSnapshot is always first.
    return enqueue(connection.gameId, async () => {
      if (connection.side === meta.humanSide) {
        await takeBotTurns(connection.gameId);
      }
      const afterBots = await loadAuthoritativeGame(
        connection.gameId,
        meta.gameMode,
      );
      if (afterBots === undefined) {
        return { message: 'Game not found', status: 404, success: false };
      }
      getConnections(connection.gameId).add(connection);
      sendGameSnapshotToConnection(connection, afterBots);
      return { data: undefined, success: true };
    });
  };

  const sendGameSnapshot = async (
    connection: GameSeatConnection,
  ): Promise<DataErrorSignature<void>> => {
    const meta = metaByGameId.get(connection.gameId);
    if (meta === undefined) {
      return { message: 'Game not found', status: 404, success: false };
    }
    const expectedSubject =
      connection.side === meta.humanSide ? meta.humanSubject : BOT_SUBJECT;
    if (connection.subject !== expectedSubject) {
      return {
        message: 'Seat not assigned to this player',
        status: 403,
        success: false,
      };
    }
    if (!getConnections(connection.gameId).has(connection)) {
      return {
        message: 'Seat connection is not registered',
        status: 400,
        success: false,
      };
    }

    const authoritative = await loadAuthoritativeGame(
      connection.gameId,
      meta.gameMode,
    );
    if (authoritative === undefined) {
      return { message: 'Game not found', status: 404, success: false };
    }

    sendGameSnapshotToConnection(connection, authoritative);
    return { data: undefined, success: true };
  };

  const unregisterSeatConnection = (connection: GameSeatConnection): void => {
    getConnections(connection.gameId).delete(connection);
  };

  const getSeatSubject = (
    gameId: string,
    side: PlayerSide,
  ): string | undefined => {
    const meta = metaByGameId.get(gameId);
    if (meta === undefined) {
      return undefined;
    }
    return side === meta.humanSide ? meta.humanSubject : BOT_SUBJECT;
  };

  return {
    createVsBotGame,
    fanoutEvent,
    fanoutRoundSnapshot,
    getSeatSubject,
    registerSeatConnection,
    sendGameSnapshot,
    submitPlayerChoice,
    unregisterSeatConnection,
  };
};

export type { GameSessionRuntime, GameSessionUseCasesDeps };
export { BOT_SUBJECT, createGameSessionUseCases };
