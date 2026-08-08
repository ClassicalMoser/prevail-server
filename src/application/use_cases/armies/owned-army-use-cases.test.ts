import type { ArmyWriteBody } from '@classicalmoser/prevail-contracts';
import type { Army } from '@classicalmoser/prevail-rules/domain';
import type { OwnedArmyStorage, OwnedArmyUseCasesPort } from '@ports';
import { createOwnedArmyUseCases } from './owned-army-use-cases';

const ownerAuthSub = 'auth0|owner-1';

const emptyArmy = (id: string): Army => ({
  id,
  units: [],
  commandCards: [],
});

const emptyWriteBody = (): ArmyWriteBody => ({
  units: [],
  commandCards: [],
});

const buildStorage = (
  overrides: Partial<OwnedArmyStorage> = {},
): OwnedArmyStorage => ({
  getOwnedArmies: vi.fn<OwnedArmyStorage['getOwnedArmies']>(),
  getOwnedArmyById: vi.fn<OwnedArmyStorage['getOwnedArmyById']>(),
  createOwnedArmy: vi.fn<OwnedArmyStorage['createOwnedArmy']>(),
  updateOwnedArmy: vi.fn<OwnedArmyStorage['updateOwnedArmy']>(),
  archiveOwnedArmy: vi.fn<OwnedArmyStorage['archiveOwnedArmy']>(),
  ...overrides,
});

const createUseCases = (
  storage: OwnedArmyStorage = buildStorage(),
): OwnedArmyUseCasesPort =>
  createOwnedArmyUseCases({ ownedArmyStorage: storage });

describe('getOwnedArmies', () => {
  it(
    'returns armies from storage for the owner',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const armies = [emptyArmy('a'), emptyArmy('b')];
      const getOwnedArmies = vi
        .fn<OwnedArmyStorage['getOwnedArmies']>()
        .mockResolvedValue({ success: true, data: armies });
      const storage = buildStorage({ getOwnedArmies });
      const useCases = createUseCases(storage);

      const result = await useCases.getOwnedArmies(ownerAuthSub);

      expect(result).toStrictEqual({ success: true, data: armies });
      expect(getOwnedArmies).toHaveBeenCalledWith(ownerAuthSub);
    },
  );
});

describe('getOwnedArmyById', () => {
  it('returns the army when found', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const army = emptyArmy('army-1');
    const getOwnedArmyById = vi
      .fn<OwnedArmyStorage['getOwnedArmyById']>()
      .mockResolvedValue({ success: true, data: army });
    const storage = buildStorage({ getOwnedArmyById });
    const useCases = createUseCases(storage);

    const result = await useCases.getOwnedArmyById(ownerAuthSub, 'army-1');

    expect(result).toStrictEqual({ success: true, data: army });
    expect(getOwnedArmyById).toHaveBeenCalledWith(ownerAuthSub, 'army-1');
  });
});

describe('createOwnedArmy', () => {
  it('returns the storage-assigned army id', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const createOwnedArmy = vi
      .fn<OwnedArmyStorage['createOwnedArmy']>()
      .mockResolvedValue({ success: true, data: 'new-id' });
    const storage = buildStorage({ createOwnedArmy });
    const useCases = createUseCases(storage);

    const result = await useCases.createOwnedArmy(ownerAuthSub);

    expect(result).toStrictEqual({ success: true, data: 'new-id' });
    expect(createOwnedArmy).toHaveBeenCalledWith(ownerAuthSub, 'Untitled army');
  });
});

describe('updateOwnedArmy', () => {
  it(
    'returns empty object on success (read via GET)',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const body = emptyWriteBody();
      const updateOwnedArmy = vi
        .fn<OwnedArmyStorage['updateOwnedArmy']>()
        .mockResolvedValue({ success: true, data: undefined });
      const storage = buildStorage({ updateOwnedArmy });
      const useCases = createUseCases(storage);

      const result = await useCases.updateOwnedArmy(
        ownerAuthSub,
        'army-1',
        body,
      );

      expect(result).toStrictEqual({ success: true, data: {} });
      expect(updateOwnedArmy).toHaveBeenCalledWith(ownerAuthSub, 'army-1', {
        armyName: 'Untitled army',
        units: body.units,
        commandCards: body.commandCards,
      });
    },
  );

  it('propagates storage errors', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const updateOwnedArmy = vi
      .fn<OwnedArmyStorage['updateOwnedArmy']>()
      .mockResolvedValue({
        success: false,
        message: 'Army not found',
        status: 404,
      });
    const storage = buildStorage({ updateOwnedArmy });
    const useCases = createUseCases(storage);

    const result = await useCases.updateOwnedArmy(
      ownerAuthSub,
      'missing',
      emptyWriteBody(),
    );

    expect(result).toStrictEqual({
      success: false,
      message: 'Army not found',
      status: 404,
    });
  });
});

describe('archiveOwnedArmy', () => {
  it('returns no-content on success', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const archiveOwnedArmy = vi
      .fn<OwnedArmyStorage['archiveOwnedArmy']>()
      .mockResolvedValue({ success: true, data: undefined });
    const storage = buildStorage({ archiveOwnedArmy });
    const useCases = createUseCases(storage);

    const result = await useCases.archiveOwnedArmy(ownerAuthSub, 'army-1');

    expect(result).toStrictEqual({ success: true });
    expect(archiveOwnedArmy).toHaveBeenCalledWith(ownerAuthSub, 'army-1');
  });
});
