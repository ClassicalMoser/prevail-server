import { army, gameSessionStore, ownedArmyStorage } from '@testing';
import { loadOwnedArmy } from './load-owned-army';

const armyId = '550e8400-e29b-41d4-a716-446655440001';

describe('loadOwnedArmy function', () => {
  it('answers the army the subject owns', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // Owned-army storage holds this army for the subject (a stand-in for the owner's saved armies).
    const store = gameSessionStore({
      ownedArmyStorage: ownedArmyStorage({ [armyId]: army(armyId) }),
    });

    await expect(
      loadOwnedArmy(store, 'sub', armyId, (failure) => failure),
    ).resolves.toStrictEqual({ data: army(armyId), success: true });
  });

  it(
    "answers the caller's wording when the army is not found",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // Storage holds no armies, so the lookup fails as not-found.
      const store = gameSessionStore({
        ownedArmyStorage: ownedArmyStorage({}),
      });

      await expect(
        // The caller supplies the wording for the failure; the function returns it unchanged.
        loadOwnedArmy(store, 'sub', armyId, () => ({
          message: 'mine',
          status: 400,
          success: false,
        })),
      ).resolves.toStrictEqual({
        message: 'mine',
        status: 400,
        success: false,
      });
    },
  );
});
