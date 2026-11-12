import { authoritativeGameStateSchema } from '@classicalmoser/prevail-rules/domain';
import { hostedBotVsBotGame, watcher } from '@testing';
import { registerWatchConnection } from './register-watch-connection';
import { stepBotVsBotGame } from './step-bot-vs-bot-game';

describe('stepBotVsBotGame function', () => {
  it(
    'returns 404 when the game is not hosted here',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { store } = await hostedBotVsBotGame();
      const { connection } = watcher('missing');

      const stepped = await stepBotVsBotGame(store, connection);

      expect(stepped).toStrictEqual({
        message: 'Game not found',
        status: 404,
        success: false,
      });
    },
  );

  it(
    'refuses a watcher that has not been registered',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { store, gameId } = await hostedBotVsBotGame();
      const { connection } = watcher(gameId);

      const stepped = await stepBotVsBotGame(store, connection);

      expect(stepped).toMatchObject({ status: 400, success: false });
    },
  );

  it(
    'streams white setup, then black setup, to the watcher as separate steps',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { store, gameId } = await hostedBotVsBotGame();
      const { connection, sent } = watcher(gameId);
      await registerWatchConnection(store, connection);

      await stepBotVsBotGame(store, connection);
      await stepBotVsBotGame(store, connection);

      const choices = sent.filter((message) => message.type === 'playerChoice');

      expect(choices).toMatchObject([
        { payload: { choiceType: 'setupUnits', player: 'white' } },
        { payload: { choiceType: 'setupUnits', player: 'black' } },
      ]);
    },
  );

  it('refuses a step once the game is over', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const { store, enginePorts, gameId } = await hostedBotVsBotGame();
    const { connection, sent } = watcher(gameId);
    await registerWatchConnection(store, connection);
    // The opening snapshot is the stored state; end the game from it.
    const opening = authoritativeGameStateSchema.parse(sent[0]?.payload);
    await enginePorts.gameStorage.updateGameState(gameId, {
      ...opening,
      winner: 'white',
    });

    const stepped = await stepBotVsBotGame(store, connection);

    expect(stepped).toStrictEqual({
      message: 'The game is over',
      status: 409,
      success: false,
    });
  });
});
