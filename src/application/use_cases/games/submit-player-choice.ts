import type {
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { enqueue } from '@application/composable/game-session/session/enqueue';
import type { GameSessionStore } from '@application/composable/game-session/session/game-session-store';
import { requireVsBotSeat } from '@application/composable/game-session/access/require-vs-bot-seat';
import { takeBotTurns } from '@application/composable/game-session/bot/take-bot-turns';

/** A choice a socket submits: the game, the seat from its path, who it is, and the choice. */
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
): Promise<DataErrorSignature<void>> => {
  const submitted: DataErrorSignature<void> = await enqueue(
    store,
    input.gameId,
    async (): Promise<DataErrorSignature<void>> => {
      // Only the seat's owner may play for it.
      const access = requireVsBotSeat(store, input);
      if (!access.success) {
        return access;
      }
      const meta = access.data;

      // A choice names the player it is for. It must be the seat's own side,
      // or a socket on one seat could play the other's cards.
      if (input.playerChoice.player !== input.side) {
        return {
          message: 'Player choice side does not match seat',
          status: 400,
          success: false,
        };
      }

      // The rules engine is the only judge of whether the choice is legal.
      const result = await store.runner.handlePlayerChoiceSubmission(
        input.gameId,
        meta.gameMode,
        input.playerChoice,
      );
      if (!result.result) {
        return { message: result.errorReason, status: 400, success: false };
      }

      // After the human plays, the bot answers until the human owes again.
      if (input.side === meta.humanSide) {
        await takeBotTurns(store, input.gameId);
      }

      return { data: undefined, success: true };
    },
  );
  return submitted;
};

export type { SubmitPlayerChoiceInput };
export { submitPlayerChoice };
