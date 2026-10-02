import type { LoggerPort, UseCasesPort } from '@ports';
import { createRoutes } from './routes';

const logger: LoggerPort = {
  error: (): void => {
    /* unused */
  },
  info: (): void => {
    /* unused */
  },
  warn: (): void => {
    /* unused */
  },
};

const useCases = (): UseCasesPort =>
  ({
    commandCardUseCases: {},
    gameSessionUseCases: {},
    ownedArmyUseCases: {},
    unitCardUseCases: {},
  }) as UseCasesPort; // route factories only need wiring; handlers are not invoked here

describe('createRoutes function', () => {
  it(
    'concatenates command, unit, army, and game route registries',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const routes = createRoutes(useCases(), logger);

      expect(routes).toHaveLength(24);
    },
  );
});
