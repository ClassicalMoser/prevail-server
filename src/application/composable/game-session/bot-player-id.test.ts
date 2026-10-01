import { BOT_PLAYER_ID } from './bot-player-id';

describe('bOT_PLAYER_ID constant', () => {
  it('is a UUID the client seat schema accepts', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(BOT_PLAYER_ID).toBe('00000000-0000-4000-8000-0000000000b0');
  });
});
