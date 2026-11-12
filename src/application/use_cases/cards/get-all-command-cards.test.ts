import type { CommandCardStorage } from '@ports';
import {
  commandCardStorageDouble,
  stubAssetStorage,
  stubCommandCardRenderer,
  unitCardStorageDouble,
} from '@testing';
import { getAllCommandCards } from './get-all-command-cards';
import type { CommandCardUseCasesDeps } from './command-card-use-cases-deps';

/** Deps where only the list read is programmed. */
const depsListing = (
  getAll: CommandCardStorage['getAllCommandCards'],
): CommandCardUseCasesDeps => ({
  assetStorage: stubAssetStorage(),
  commandCardRenderer: stubCommandCardRenderer(),
  commandCardStorage: commandCardStorageDouble({ getAllCommandCards: getAll }),
  unitCardStorage: unitCardStorageDouble(),
});

describe('getAllCommandCards function', () => {
  it('answers the storage failure unchanged', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // Storage's list read fails; the renderer and asset storage are inert stubs, as this use case does not draw.
    const deps = depsListing(
      vi.fn<CommandCardStorage['getAllCommandCards']>().mockResolvedValue({
        message: 'boom',
        status: 500,
        success: false,
      }),
    );

    // The use case adds nothing to a storage failure.
    await expect(getAllCommandCards(deps)).resolves.toStrictEqual({
      message: 'boom',
      status: 500,
      success: false,
    });
  });

  it(
    'answers an empty catalog as an empty list',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A catalog with no cards yet is a valid answer, not an error.
      const deps = depsListing(
        vi
          .fn<CommandCardStorage['getAllCommandCards']>()
          .mockResolvedValue({ data: [], success: true }),
      );

      await expect(getAllCommandCards(deps)).resolves.toStrictEqual({
        data: [],
        success: true,
      });
    },
  );
});
