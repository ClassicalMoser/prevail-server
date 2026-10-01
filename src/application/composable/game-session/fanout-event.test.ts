import assert from 'node:assert/strict';
import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
import type { ChooseCardEvent } from '@classicalmoser/prevail-rules/domain';
import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import { createInMemoryEnginePorts } from '@infrastructure';
import type { GameSessionOutbound } from '@ports';
import {
  army,
  blackArmyId,
  ownedArmyStorage,
  whiteArmyId,
} from '@testing';
import { createGameSessionUseCases } from '../../use_cases/games/game-session-use-cases';

describe('fanoutEvent function', () => {
  it(
    'redacts opponent chooseCard card identity for the other seat',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const runtimeRef: {
        current?: ReturnType<typeof createGameSessionUseCases>;
      } = {};
      const enginePorts = createInMemoryEnginePorts({
        onEventAppended: (gameId, _round, event) => {
          runtimeRef.current?.fanoutEvent(gameId, event);
        },
      });

      const runtime = createGameSessionUseCases({
        botTurnGapMs: 0,
        enginePorts,
        ownedArmyStorage: ownedArmyStorage({
          [blackArmyId]: army(blackArmyId),
          [whiteArmyId]: army(whiteArmyId),
        }),
      });
      runtimeRef.current = runtime;

      const body: CreateVsBotGameBody = {
        blackArmyId,
        gameMode: 'mini',
        humanSide: 'white',
        whiteArmyId,
      };
      const created = await runtime.createVsBotGame('human-sub', body);
      expect(created).toMatchObject({
        success: true,
        data: expect.any(String),
      });
      assert.ok(created.success);
      const gameId = created.data;

      const whiteMessages: GameSessionOutbound[] = [];
      const blackMessages: GameSessionOutbound[] = [];

      const whiteRegistered = await runtime.registerSeatConnection({
        gameId,
        send: (message) => {
          whiteMessages.push(message);
        },
        side: 'white',
        subject: 'human-sub',
      });
      expect(whiteRegistered.success).toBe(true);

      const blackRegistered = await runtime.registerSeatConnection({
        gameId,
        send: (message) => {
          blackMessages.push(message);
        },
        side: 'black',
        subject: 'bot:prevail',
      });
      expect(blackRegistered.success).toBe(true);

      const choice: ChooseCardEvent = {
        card: tempCommandCards[0],
        choiceType: 'chooseCard',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
      };
      runtime.fanoutEvent(gameId, choice);

      const whiteChoice = whiteMessages.find((message) => message.type === 'playerChoice');
      const blackChoice = blackMessages.find((message) => message.type === 'playerChoice');

      expect(whiteChoice?.payload).toMatchObject({
        card: tempCommandCards[0],
        player: 'white',
      });
      expect(blackChoice?.payload).toMatchObject({
        card: 'hidden',
        player: 'white',
      });
    },
  );
});
