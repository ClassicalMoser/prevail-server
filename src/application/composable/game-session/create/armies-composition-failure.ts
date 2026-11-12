import type { Army, GameModeName } from '@classicalmoser/prevail-rules/domain';
import { armySchemaForMode } from '@classicalmoser/prevail-rules/domain';
import type { ErrorSignature } from '@ports';

/**
 * Reject a pair of armies that fail the rules composition for `gameMode`.
 *
 * White is checked first. The message is the rules issue, named by side, so
 * the client can show which list to fix. A passing pair returns undefined
 * and the caller may save the game.
 *
 * @param whiteArmy - Army that will sit on the white side.
 * @param blackArmy - Army that will sit on the black side.
 * @param gameMode - Mode the game is about to be created with.
 * @returns A 400 envelope, or undefined when both armies are legal.
 */
const armiesCompositionFailure = (
  whiteArmy: Army,
  blackArmy: Army,
  gameMode: GameModeName,
): ErrorSignature | undefined => {
  const sides = [
    { army: whiteArmy, label: 'White' },
    { army: blackArmy, label: 'Black' },
  ] as const;

  for (const side of sides) {
    // The rules schema for the mode is the legality check an army list must pass
    // before a game starts with it.
    const parsed = armySchemaForMode(gameMode).safeParse(side.army);
    if (parsed.success) {
      continue;
    }
    const issue = parsed.error.issues[0];
    const detail =
      issue === undefined ? 'does not match this game mode' : issue.message;
    const failure: ErrorSignature = {
      message: `${side.label} army: ${detail}`,
      status: 400,
      success: false,
    };
    return failure;
  }

  return undefined;
};

export { armiesCompositionFailure };
