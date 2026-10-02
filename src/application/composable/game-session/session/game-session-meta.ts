import type {
  GameModeName,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';

/** Process-local record of who created a live game and which side they took. */
interface GameSessionMeta {
  gameMode: GameModeName;
  humanSide: PlayerSide;
  humanSubject: string;
}

export type { GameSessionMeta };
