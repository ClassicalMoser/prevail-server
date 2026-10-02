import { createInMemoryEnginePorts } from '@infrastructure';
import { army, ownedArmyStorage, whiteArmyId } from '@testing';
import { createGameSessionUseCases } from './game-session-use-cases';

describe('createGameSessionUseCases function', () => {
  it(
    'exposes the session port methods and fanout hooks',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const runtime = createGameSessionUseCases({
        botTurnGapMs: 0,
        enginePorts: createInMemoryEnginePorts(),
        ownedArmyStorage: ownedArmyStorage({
          [whiteArmyId]: army(whiteArmyId),
        }),
      });

      expect(runtime.createVsBotGame).toBeTypeOf('function');
      expect(runtime.fanoutEvent).toBeTypeOf('function');
      expect(runtime.fanoutRoundSnapshot).toBeTypeOf('function');
      expect(runtime.registerSeatConnection).toBeTypeOf('function');
    },
  );
});
