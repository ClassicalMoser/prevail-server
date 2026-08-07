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
  it('returns armies from storage for the owner', async () => {
    expect.hasAssertions();

    const armies = [emptyArmy('a'), emptyArmy('b')];
    const storage = buildStorage({
      getOwnedArmies: vi.fn().mockResolvedValue({ success: true, data: armies }),
    });
    const useCases = createUseCases(storage);

    const result = await useCases.getOwnedArmies(ownerAuthSub);

    expect(result).toStrictEqual({ success: true, data: armies });
    expect(storage.getOwnedArmies).toHaveBeenCalledWith(ownerAuthSub);
  });
});

describe('getOwnedArmyById', () => {
  it('returns the army when found', async () => {
    expect.hasAssertions();

    const army = emptyArmy('army-1');
    const storage = buildStorage({
      getOwnedArmyById: vi
        .fn()
        .mockResolvedValue({ success: true, data: army }),
    });
    const useCases = createUseCases(storage);

    const result = await useCases.getOwnedArmyById(ownerAuthSub, 'army-1');

    expect(result).toStrictEqual({ success: true, data: army });
    expect(storage.getOwnedArmyById).toHaveBeenCalledWith(
      ownerAuthSub,
      'army-1',
    );
  });
});

describe('createOwnedArmy', () => {
  it('returns the storage-assigned army id', async () => {
    expect.hasAssertions();

    const storage = buildStorage({
      createOwnedArmy: vi
        .fn()
        .mockResolvedValue({ success: true, data: 'new-id' }),
    });
    const useCases = createUseCases(storage);

    const result = await useCases.createOwnedArmy(ownerAuthSub);

    expect(result).toStrictEqual({ success: true, data: 'new-id' });
    expect(storage.createOwnedArmy).toHaveBeenCalledWith(ownerAuthSub);
  });
});

describe('updateOwnedArmy', () => {
  it('returns empty object on success (read via GET)', async () => {
    expect.hasAssertions();

    const body = emptyWriteBody();
    const storage = buildStorage({
      updateOwnedArmy: vi
        .fn()
        .mockResolvedValue({ success: true, data: undefined }),
    });
    const useCases = createUseCases(storage);

    const result = await useCases.updateOwnedArmy(
      ownerAuthSub,
      'army-1',
      body,
    );

    expect(result).toStrictEqual({ success: true, data: {} });
    expect(storage.updateOwnedArmy).toHaveBeenCalledWith(
      ownerAuthSub,
      'army-1',
      body,
    );
  });

  it('propagates storage errors', async () => {
    expect.hasAssertions();

    const storage = buildStorage({
      updateOwnedArmy: vi.fn().mockResolvedValue({
        success: false,
        message: 'Army not found',
        status: 404,
      }),
    });
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
  it('returns no-content on success', async () => {
    expect.hasAssertions();

    const storage = buildStorage({
      archiveOwnedArmy: vi
        .fn()
        .mockResolvedValue({ success: true, data: undefined }),
    });
    const useCases = createUseCases(storage);

    const result = await useCases.archiveOwnedArmy(ownerAuthSub, 'army-1');

    expect(result).toStrictEqual({ success: true });
    expect(storage.archiveOwnedArmy).toHaveBeenCalledWith(
      ownerAuthSub,
      'army-1',
    );
  });
});
