import type {
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { enqueue } from '@application/composable/game-session/enqueue';
import type { GameSessionStore } from '@application/composable/game-session/game-session-store';
import { subjectForSeat } from '@application/composable/game-session/subject-for-seat';
import { takeBotTurns } from '@application/composable/game-session/take-bot-turns';

interface SubmitPlayerChoiceInput {
  gameId: string;
  side: PlayerSide;
  subject: string;
  playerChoice: PlayerChoiceEvent;
}

/**
 * Submit a human or bot choice on the game's queue.
 *
 * The subject must own the seat, and the choice's player must match that
 * seat. After a human submit, the bot plays until the next choice is the
 * human's again.
 *
 * @param store - Live-game memory.
 * @param input - Game, seat, subject, and choice.
 * @returns An empty success, or a 404, 403, or 400 envelope.
 */
const submitPlayerChoice = async (
  store: GameSessionStore,
  input: SubmitPlayerChoiceInput,
): Promise<DataErrorSignature<void>> =>
  enqueue(store, input.gameId, async () => {
    const meta = store.metaByGameId.get(input.gameId);
    if (meta === undefined) {
      return { message: 'Game not found', status: 404, success: false };
    }

    const expectedSubject = subjectForSeat(meta, input.side);
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

    const result = await store.runner.handlePlayerChoiceSubmission(
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
      await takeBotTurns(store, input.gameId);
    }

    return { data: undefined, success: true };
  });

export type { SubmitPlayerChoiceInput };
export { submitPlayerChoice };
