import { whiteInGameWsContract } from '@classicalmoser/prevail-contracts';
import type { GameSessionOutbound } from '@ports';
import assert from 'node:assert/strict';
import { createInMemoryEnginePorts } from '@infrastructure';
import { blackArmyId, miniArmy, ownedArmyStorage, whiteArmyId } from '@testing';
import { createGameSessionUseCases } from './game-session-use-cases';

describe('sendGameSnapshot function', () => {
  it(
    'resends the current seat-visible gameSnapshot on explicit request',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const enginePorts = createInMemoryEnginePorts();
      const runtime = createGameSessionUseCases({
        botTurnGapMs: 0,
        enginePorts,
        ownedArmyStorage: ownedArmyStorage({
          [blackArmyId]: miniArmy(blackArmyId),
          [whiteArmyId]: miniArmy(whiteArmyId),
        }),
      });

      const created = await runtime.createVsBotGame('auth0|human-sub', {
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
      const registered = await runtime.registerSeatConnection(connection);
      expect(registered.success).toBe(true);
      messages.length = 0;

      const sent = await runtime.sendGameSnapshot(connection);
      expect(sent).toStrictEqual({ data: undefined, success: true });
      expect(messages).toStrictEqual([
        expect.objectContaining({ type: 'gameSnapshot' }),
      ]);
      expect(
        whiteInGameWsContract.validators.outbound.gameSnapshot.parse(
          structuredClone(messages[0]?.payload),
        ).id,
      ).toBe(created.data);
    },
  );
});
