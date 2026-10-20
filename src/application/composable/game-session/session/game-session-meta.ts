import type {
  GameModeName,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';

/**
 * Process-local record for a human-vs-bot game.
 *
 * The human subject may open their seat. The other seat is the bot subject.
 */
interface VsBotSessionMeta {
  kind: 'vsBot';
  gameMode: GameModeName;
  humanSide: PlayerSide;
  humanSubject: string;
}

/**
 * Process-local record for a bot-vs-bot game.
 *
 * The creating subject may read and step the game. There is no seat.
 * `stuck` stays set after the selector fails so a later step does not play.
 */
interface BotVsBotSessionMeta {
  kind: 'botVsBot';
  gameMode: GameModeName;
  creatorSubject: string;
  stuck: boolean;
}

/** Who may touch a live game, and which rules mode it was created with. */
type GameSessionMeta = VsBotSessionMeta | BotVsBotSessionMeta;

export type { BotVsBotSessionMeta, GameSessionMeta, VsBotSessionMeta };
