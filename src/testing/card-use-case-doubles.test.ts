import type { CommandCardStorage } from '@ports';
import {
  commandCardStorageDouble,
  namedUnitCardStorage,
  stubAssetStorage,
} from './card-use-case-doubles';

describe('card use-case doubles', () => {
  it('names every unit id a lookup asks for', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const result = await namedUnitCardStorage().getUnitCardsByIds(['a', 'b']);

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

    const getCommandCardById =
      vi.fn<CommandCardStorage['getCommandCardById']>();
    const storage = commandCardStorageDouble({ getCommandCardById });

    expect(storage.getCommandCardById).toBe(getCommandCardById);
  });

  it('reports every asset as already stored', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    await expect(stubAssetStorage().objectExists('key')).resolves.toBe(true);
  });
});
