import { DEFAULT_BOT_TURN_GAP_MS } from './default-bot-turn-gap';

describe('dEFAULT_BOT_TURN_GAP_MS constant', () => {
  it('paces consecutive bot submits at one second', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(DEFAULT_BOT_TURN_GAP_MS).toBe(1000);
  });
});
