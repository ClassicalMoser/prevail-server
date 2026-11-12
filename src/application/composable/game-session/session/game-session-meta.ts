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
  /** The rules mode, needed to load the stored game back. */
  gameMode: GameModeName;
  /** The seat the human took; the other seat belongs to the bot. */
  humanSide: PlayerSide;
  /** Auth0 subject of the human; kept here because it is not a UUID and cannot sit on the game. */
  humanSubject: string;
}

/**
 * Process-local record for a bot-vs-bot game.
 *
 * The creating subject may watch and step the game over its socket. There
 * is no seat. `stuck` stays set after the bot fails so a later step does
 * not play.
 */
interface BotVsBotSessionMeta {
  kind: 'botVsBot';
  /** The rules mode, needed to load the stored game back. */
  gameMode: GameModeName;
  /** The only subject allowed to watch and step this game. */
  creatorSubject: string;
  /** Set once a bot or engine failure halts the game; every later step is refused. */
  stuck: boolean;
}

/** Who may touch a live game, and which rules mode it was created with. */
type GameSessionMeta = VsBotSessionMeta | BotVsBotSessionMeta;

export type { BotVsBotSessionMeta, GameSessionMeta, VsBotSessionMeta };
