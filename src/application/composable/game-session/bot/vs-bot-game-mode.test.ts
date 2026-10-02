import { VS_BOT_GAME_MODE } from './vs-bot-game-mode';

describe('vS_BOT_GAME_MODE constant', () => {
  it('locks vs-bot games to mini', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(VS_BOT_GAME_MODE).toBe('mini');
  });
});
