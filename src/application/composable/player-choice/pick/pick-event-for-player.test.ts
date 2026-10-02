import { pickEventForPlayer } from './pick-event-for-player';

const firstAlways = {
  nextFloat: (): number => 0,
};

describe('pickEventForPlayer function', () => {
  it(
    'returns undefined when no event belongs to the acting player',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const event = pickEventForPlayer(
        [{ player: 'white' as const, value: 1 }],
        'black',
        firstAlways,
      );

      expect(event).toBeUndefined();
    },
  );

  it(
    'keeps only the acting player events and picks the first of those',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const event = pickEventForPlayer(
        [
          { player: 'white' as const, value: 1 },
          { player: 'black' as const, value: 2 },
          { player: 'black' as const, value: 3 },
        ],
        'black',
        firstAlways,
      );

      expect(event).toStrictEqual({ player: 'black', value: 2 });
    },
  );
});
