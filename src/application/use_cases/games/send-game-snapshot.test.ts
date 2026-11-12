import { whiteInGameWsContract } from '@classicalmoser/prevail-contracts';
import type { GameSessionOutbound } from '@ports';
import assert from 'node:assert/strict';
import { blackArmyId, miniArmy, liveGameStore, whiteArmyId } from '@testing';
import { createVsBotGame } from './create-vs-bot-game';
import { registerSeatConnection } from './register-seat-connection';
import { sendGameSnapshot } from './send-game-snapshot';

describe('sendGameSnapshot function', () => {
  it(
    'resends the current seat-visible gameSnapshot on explicit request',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { store } = liveGameStore({
        [blackArmyId]: miniArmy(blackArmyId),
        [whiteArmyId]: miniArmy(whiteArmyId),
      });

      const created = await createVsBotGame(store, 'auth0|human-sub', {
        blackArmyId,
        gameMode: 'mini',
        humanSide: 'white',
        whiteArmyId,
      });
      assert.ok(created.success);

      const messages: GameSessionOutbound[] = [];
      const connection = {
        gameId: created.data,
        send: (message: GameSessionOutbound): void => {
          messages.push(message);
        },
        side: 'white' as const,
        subject: 'auth0|human-sub',
      };
      const registered = await registerSeatConnection(store, connection);
      expect(registered.success).toBe(true);
      messages.length = 0;

      const sent = await sendGameSnapshot(store, connection);
      expect(sent).toStrictEqual({ data: undefined, success: true });
      expect(messages).toStrictEqual([
        expect.objectContaining({ type: 'gameSnapshot' }),
      ]);
      expect(
        whiteInGameWsContract.validators.outbound.gameSnapshot.parse(
          structuredClone(messages[0]?.payload),
        ).visibility,
      ).toBe('whiteSeen');
    },
  );
});
