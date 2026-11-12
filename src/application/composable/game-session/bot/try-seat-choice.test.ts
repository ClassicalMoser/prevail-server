import { createInitialGameState } from '@classicalmoser/prevail-rules/domain';
import {
  blackMiniStarterArmy,
  whiteMiniStarterArmy,
} from '@classicalmoser/prevail-rules/sampleValues';
import { trySeatChoice } from './try-seat-choice';

/** A fresh mini game. It opens with white owing its setup. */
const openingState = createInitialGameState({
  blackArmy: blackMiniStarterArmy,
  gameMode: 'mini',
  whiteArmy: whiteMiniStarterArmy,
});

describe('trySeatChoice function', () => {
  it(
    'logs and returns undefined when the rules bot throws',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // Silence and capture the error log; the failure is reported, not thrown to the caller.
      const logged = vi.spyOn(console, 'error').mockReturnValue(undefined);
      // Black owes nothing at the opening, so the rules bot throws.
      const choice = trySeatChoice({ seat: 'black', state: openingState });

      expect(choice).toBeUndefined();
      expect(logged).toHaveBeenCalledTimes(1);

      logged.mockRestore();
    },
  );
});
