import { createGameRunner } from '@classicalmoser/prevail-rules/application';
import type { EnginePorts } from '@classicalmoser/prevail-rules/application';
import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
import {
  createEmptyGameState,
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
import { selectRandomPlayerChoice } from './select-random-player-choice';

const BOT_SUBJECT = 'bot:prevail';
const VS_BOT_GAME_MODE = 'mini' as const satisfies GameModeName;
const MAX_BOT_TURNS_PER_BURST = 64;

interface GameSessionMeta {
  gameMode: GameModeName;
  humanSide: PlayerSide;
  humanSubject: string;
}

interface GameSessionUseCasesDeps {
  enginePorts: EnginePorts;
  ownedArmyStorage: OwnedArmyStorage;
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

  const fanoutRoundSnapshot = async (
    gameId: string,
    _roundNumber: number,
    _gameState: GameState,
  ): Promise<void> => {
    const meta = metaByGameId.get(gameId);
    if (meta === undefined) {
      return;
    }
    const gameResult = await deps.enginePorts.gameStorage.getGame(
      gameId,
      meta.gameMode,
    );
    if (gameResult === undefined || !gameResult.result) {
      return;
    }
    const authoritative = gameResult.data as GameForVisibility<'authoritative'>;
    for (const side of ['white', 'black'] as const) {
      const visibility = side === 'white' ? 'whiteSeen' : 'blackSeen';
      sendToSeat(gameId, side, {
        payload: projectGameForVisibility(authoritative, visibility),
        type: 'roundSnapshot',
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
    const gameResult = await deps.enginePorts.gameStorage.getGame(
      gameId,
      gameMode,
    );
    if (gameResult === undefined || !gameResult.result) {
      return undefined;
    }
    return gameResult.data.gameState;
  };

  /**
   * While the next expected choice belongs to the bot (or bothPlayers with a
   * bot sample available), submit a random legal choice.
   */
  const takeBotTurns = async (gameId: string): Promise<void> => {
    const meta = metaByGameId.get(gameId);
    if (meta === undefined) {
      return;
    }
    const botSide = otherSide(meta.humanSide);

    for (let i = 0; i < MAX_BOT_TURNS_PER_BURST; i += 1) {
      const state = await loadAuthoritativeState(gameId, meta.gameMode);
      if (state === undefined) {
        return;
      }

      const options = getLegalPlayerChoiceOptions(state);
      if (options === null) {
        return;
      }
      if (options.playerSource === meta.humanSide) {
        return;
      }

      const choice = selectRandomPlayerChoice(options, state, botSide);
      if (choice === null) {
        return;
      }

      const result = await runner.handlePlayerChoiceSubmission(
        gameId,
        meta.gameMode,
        choice,
      );
      if (!result.result) {
        return;
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
    const gameState = createEmptyGameState(VS_BOT_GAME_MODE);
    const game: GameForVisibility<'authoritative'> = {
      blackArmy,
      blackPlayer: body.humanSide === 'black' ? subject : BOT_SUBJECT,
      gameMode: VS_BOT_GAME_MODE,
      gameState: gameState as GameForVisibility<'authoritative'>['gameState'],
      id: gameId,
      whiteArmy,
      whitePlayer: body.humanSide === 'white' ? subject : BOT_SUBJECT,
    };

    const saveResult = await deps.enginePorts.gameStorage.saveNewGame(game);
    if (!saveResult.result) {
      return {
        message: saveResult.errorReason,
        status: 500,
        success: false,
      };
    }

    const streamResult =
      await deps.enginePorts.eventStreamStorage.newEventStream(
        gameId,
        game.gameState.currentRoundState.roundNumber,
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

  const registerSeatConnection = (
    connection: GameSeatConnection,
  ): DataErrorSignature<void> => {
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
    getConnections(connection.gameId).add(connection);
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
    submitPlayerChoice,
    unregisterSeatConnection,
  };
};

export type { GameSessionRuntime, GameSessionUseCasesDeps };
export { BOT_SUBJECT, createGameSessionUseCases };
