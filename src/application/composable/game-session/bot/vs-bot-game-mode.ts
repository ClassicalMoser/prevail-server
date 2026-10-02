import type { GameModeName } from '@classicalmoser/prevail-rules/domain';

/**
 * Vs-bot games are mini only.
 *
 * The create contract locks the mode. The constant exists so the session
 * does not repeat the literal next to every initial state and saved game.
 */
const VS_BOT_GAME_MODE = 'mini' as const satisfies GameModeName;

export { VS_BOT_GAME_MODE };
