import type { CommandCardStorage } from '@ports';
import {
  commandCardStorageDouble,
  namedUnitCardStorage,
  stubAssetStorage,
} from './card-use-case-doubles';

describe('card use-case doubles', () => {
  it('names every unit id a lookup asks for', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // Two ids stand for the units an army names.
    const result = await namedUnitCardStorage().getUnitCardsByIds(['a', 'b']);

    // Each asked id comes back with a name derived from it, so a use case can
    // be tested without a catalog.
    expect(result).toMatchObject({
      data: [
        { id: 'a', name: 'Unit-a' },
        { id: 'b', name: 'Unit-b' },
      ],
      success: true,
    });
  });

  it('lets a test program just the method it reads', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A mock of the one storage method a test wants to program.
    const getCommandCardById =
      vi.fn<CommandCardStorage['getCommandCardById']>();
    const storage = commandCardStorageDouble({ getCommandCardById });

    // The double hands the test's own mock through, not a copy.
    expect(storage.getCommandCardById).toBe(getCommandCardById);
  });

  it('reports every asset as already stored', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // Every key reads as already stored, so a use case skips the render and
    // write.
    await expect(stubAssetStorage().objectExists('key')).resolves.toBe(true);
  });
});
