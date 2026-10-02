import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import { pickMoveCommander } from './pick-move-commander';

const firstAlways = {
  nextFloat: (): number => 0,
};

const options = (
  overrides: Partial<
    Extract<LegalPlayerChoiceOptions, { choiceType: 'moveCommander' }>
  > = {},
): Extract<LegalPlayerChoiceOptions, { choiceType: 'moveCommander' }> => ({
  choiceType: 'moveCommander',
  destinations: ['E-4', 'E-3'],
  expectedEventNumber: 4,
  playerSource: 'white',
  startingCoordinate: 'E-5',
  ...overrides,
});

describe('pickMoveCommander function', () => {
  it(
    'returns undefined when the commander has no starting coordinate',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickMoveCommander(
        options({ startingCoordinate: null }),
        'white',
        firstAlways,
      );

      expect(choice).toBeUndefined();
    },
  );

  it('moves from the start to the first destination', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const choice = pickMoveCommander(options(), 'white', firstAlways);

    expect(choice).toStrictEqual({
      choiceType: 'moveCommander',
      eventNumber: 4,
      eventType: 'playerChoice',
      from: 'E-5',
      player: 'white',
      to: 'E-4',
    });
  });
});
