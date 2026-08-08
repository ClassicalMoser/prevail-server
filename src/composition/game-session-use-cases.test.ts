import assert from 'node:assert/strict';
import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
import { whiteInGameWsContract } from '@classicalmoser/prevail-contracts';
import {
  getLegalPlayerChoiceOptions,
  PLAYER_CHOICE_EVENT_TYPE,
} from '@classicalmoser/prevail-rules/domain';
import type {
  Army,
  CommandCard,
  UnitType,
} from '@classicalmoser/prevail-rules/domain';
import { createGameSessionUseCases } from '@application';
import { createInMemoryEnginePorts } from '@infrastructure';
import type {
  DataErrorSignature,
  GameSessionOutbound,
  OwnedArmyStorage,
} from '@ports';

const army = (id: string): Army => ({
  commandCards: [],
  id,
  units: [],
});

const unitType = (overrides: Partial<UnitType> = {}): UnitType => ({
  cost: 10,
  id: '11111111-1111-4111-8111-111111111111',
  imageUrl: 'https://example.com/unit.png',
  limit: 8,
  morale: 2,
  name: 'Test Unit',
  stats: {
    attack: 1,
    flexibility: 1,
    range: 0,
    retreat: 1,
    reverse: 0,
    rout: 1,
    speed: 1,
  },
  traits: ['formation'],
  version: '1.0.0',
  ...overrides,
});

const commandCard = (
  initiative: 1 | 2 | 3 | 4,
  index: number,
): CommandCard => ({
  command: {
    modifiers: [],
    number: 1,
    restrictions: {
      inspirationRangeRestriction: 1,
      traitRestrictions: [],
      unitRestrictions: [],
    },
    size: 'units',
    type: 'movement',
  },
  id: `22222222-2222-4222-8222-2222222222${String(index).padStart(2, '0')}`,
  initiative,
  modifiers: ['attack'],
  name: `Card ${initiative}-${index}`,
  roundEffect: {
    modifiers: [{ type: 'attack', value: 1 }],
    restrictions: {
      inspirationRangeRestriction: 1,
      traitRestrictions: [],
      unitRestrictions: [],
    },
  },
  unitSupport: { count: 1, supportType: 'generic' },
  version: '1.0.0',
});

/** Mini-mode-legal army for wire schema assertions. */
const miniArmy = (id: string): Army => ({
  commandCards: ([1, 2, 3, 4] as const).flatMap((initiative) =>
    [0, 1].map((copy) => commandCard(initiative, initiative * 10 + copy)),
  ),
  id,
  units: [{ count: 4, unitType: unitType({ cost: 10, morale: 2 }) }],
});

const whiteArmyId = '550e8400-e29b-41d4-a716-446655440001';
const blackArmyId = '550e8400-e29b-41d4-a716-446655440002';

const ownedArmyStorage = (armies: Record<string, Army>): OwnedArmyStorage => ({
  archiveOwnedArmy: async (): Promise<DataErrorSignature<void>> => ({
    data: undefined,
    success: true,
  }),
  createOwnedArmy: async (): Promise<DataErrorSignature<string>> => ({
    data: whiteArmyId,
    success: true,
  }),
  getOwnedArmies: async (): Promise<DataErrorSignature<Army[]>> => ({
    data: Object.values(armies),
    success: true,
  }),
  getOwnedArmyById: async (
    _sub: string,
    id: string,
  ): Promise<DataErrorSignature<Army>> => {
    const found = armies[id];
    if (found === undefined) {
      return { message: 'Not found', status: 404, success: false };
    }
    return { data: found, success: true };
  },
  updateOwnedArmy: async (): Promise<DataErrorSignature<void>> => ({
    data: undefined,
    success: true,
  }),
});

describe('createGameSessionUseCases vs-bot create', () => {
  it(
    'creates a vs-bot game and assigns the human seat',
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
        onRoundSnapshotSaved: (gameId, round, state) => {
          runtimeRef.current?.fanoutRoundSnapshot(gameId, round, state);
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

      const result = await runtime.createVsBotGame('human-sub', body);
      expect(result).toMatchObject({ success: true, data: expect.any(String) });
      assert.ok(result.success);
      expect(runtime.getSeatSubject(result.data, 'white')).toBe('human-sub');
      expect(runtime.getSeatSubject(result.data, 'black')).toBe('bot:prevail');
    },
  );

  it(
    'rejects seat registration for the wrong subject',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const enginePorts = createInMemoryEnginePorts();
      const runtime = createGameSessionUseCases({
        botTurnGapMs: 0,
        enginePorts,
        ownedArmyStorage: ownedArmyStorage({
          [blackArmyId]: army(blackArmyId),
          [whiteArmyId]: army(whiteArmyId),
        }),
      });

      const created = await runtime.createVsBotGame('human-sub', {
        blackArmyId,
        gameMode: 'mini',
        humanSide: 'white',
        whiteArmyId,
      });
      expect(created).toMatchObject({
        success: true,
        data: expect.any(String),
      });
      assert.ok(created.success);

      const registered = await runtime.registerSeatConnection({
        gameId: created.data,
        send: () => {
          /* Unused */
        },
        side: 'white',
        subject: 'other-sub',
      });

      expect(registered).toMatchObject({
        message: expect.any(String),
        status: 403,
        success: false,
      });
    },
  );

  it(
    'sends a seat-visible gameSnapshot when a seat connects',
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
      expect(created).toMatchObject({
        success: true,
        data: expect.any(String),
      });
      assert.ok(created.success);

      const messages: GameSessionOutbound[] = [];
      const registered = await runtime.registerSeatConnection({
        gameId: created.data,
        send: (message) => {
          messages.push(message);
        },
        side: 'white',
        subject: 'auth0|human-sub',
      });

      expect(registered.success).toBe(true);
      expect(messages).toStrictEqual([
        expect.objectContaining({ type: 'gameSnapshot' }),
      ]);

      // Client parses the JSON wire form with the seat contract schema.
      const parsed =
        whiteInGameWsContract.validators.outbound.gameSnapshot.parse(
          structuredClone(messages[0]?.payload),
        );
      expect(parsed).toMatchObject({
        blackPlayer: '00000000-0000-4000-8000-0000000000b0',
        gameState: {
          cardState: { visibility: 'whiteSeen' },
        },
        id: created.data,
        whitePlayer: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu,
        ),
      });
      expect([
        parsed.gameState.reservedUnits.length,
        parsed.gameState.cardState.white.inHand.length,
        parsed.gameState.cardState.black.inHand.length,
      ]).toStrictEqual([8, 8, 8]);
    },
  );

  it(
    'serializes reconnect bot resume with in-flight submits and opens with gameSnapshot',
    { timeout: 15_000 },
    async () => {
      expect.hasAssertions();

      const runtimeRef: {
        current?: ReturnType<typeof createGameSessionUseCases>;
      } = {};
      const enginePorts = createInMemoryEnginePorts({
        onEventAppended: (gameId, _round, event) => {
          runtimeRef.current?.fanoutEvent(gameId, event);
        },
        onRoundSnapshotSaved: (gameId, round, state) => {
          void runtimeRef.current?.fanoutRoundSnapshot(gameId, round, state);
        },
      });
      const runtime = createGameSessionUseCases({
        botTurnGapMs: 25,
        enginePorts,
        ownedArmyStorage: ownedArmyStorage({
          [blackArmyId]: miniArmy(blackArmyId),
          [whiteArmyId]: miniArmy(whiteArmyId),
        }),
      });
      runtimeRef.current = runtime;

      const created = await runtime.createVsBotGame('auth0|human-sub', {
        blackArmyId,
        gameMode: 'mini',
        humanSide: 'white',
        whiteArmyId,
      });
      assert.ok(created.success);

      const game = await enginePorts.gameStorage.getGame(created.data, 'mini');
      assert.ok(game !== undefined);
      assert.ok(game.result);
      const options = getLegalPlayerChoiceOptions(game.data.gameState);
      assert.ok(options !== null);
      assert.ok(options.choiceType === 'setupUnits');

      const { setupUnits } = options;
      const unitPlacements = setupUnits.units.map((unit, index) => ({
        placement: {
          coordinate: setupUnits.coordinates[index]!,
          facing: 'south' as const,
        },
        unit,
      }));

      const messages: GameSessionOutbound[] = [];
      const submitPromise = runtime.submitPlayerChoice({
        gameId: created.data,
        playerChoice: {
          choiceType: 'setupUnits',
          commanderCoordinate: unitPlacements[0]!.placement.coordinate,
          eventNumber: options.expectedEventNumber,
          eventType: PLAYER_CHOICE_EVENT_TYPE,
          player: 'white',
          unitPlacements,
        },
        side: 'white',
        subject: 'auth0|human-sub',
      });

      const registerPromise = runtime.registerSeatConnection({
        gameId: created.data,
        send: (message) => {
          messages.push(message);
        },
        side: 'white',
        subject: 'auth0|human-sub',
      });

      const [submitted, registered] = await Promise.all([
        submitPromise,
        registerPromise,
      ]);

      expect(submitted).toStrictEqual({ data: undefined, success: true });
      expect(registered).toStrictEqual({ data: undefined, success: true });
      expect(messages[0]).toMatchObject({ type: 'gameSnapshot' });
    },
  );

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

  it(
    'initializes the event stream for currentRoundNumber so setup submits',
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
      expect(created).toMatchObject({
        success: true,
        data: expect.any(String),
      });
      assert.ok(created.success);

      const streamForProcessRound =
        await enginePorts.eventStreamStorage.getEventStream(created.data, 0);
      const wrongRoundStream =
        await enginePorts.eventStreamStorage.getEventStream(created.data, 1);
      expect({
        stream: streamForProcessRound,
        wrongRound: wrongRoundStream,
      }).toStrictEqual({
        stream: { data: expect.any(Array), result: true },
        wrongRound: { data: undefined, result: true },
      });

      const game = await enginePorts.gameStorage.getGame(created.data, 'mini');
      expect(game).toMatchObject({ result: true, data: expect.anything() });
      assert.ok(game !== undefined);
      assert.ok(game.result);

      const options = getLegalPlayerChoiceOptions(game.data.gameState);
      expect(options).toMatchObject({ choiceType: 'setupUnits' });
      assert.ok(options !== null);
      assert.ok(options.choiceType === 'setupUnits');

      const { setupUnits } = options;
      const unitPlacements = setupUnits.units.map((unit, index) => ({
        placement: {
          coordinate: setupUnits.coordinates[index]!,
          facing: 'south' as const,
        },
        unit,
      }));
      const submitted = await runtime.submitPlayerChoice({
        gameId: created.data,
        playerChoice: {
          choiceType: 'setupUnits',
          commanderCoordinate: unitPlacements[0]!.placement.coordinate,
          eventNumber: options.expectedEventNumber,
          eventType: PLAYER_CHOICE_EVENT_TYPE,
          player: 'white',
          unitPlacements,
        },
        side: 'white',
        subject: 'auth0|human-sub',
      });

      expect(submitted).toStrictEqual({ data: undefined, success: true });
    },
  );
});
