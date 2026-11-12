import type {
  AssetStorage,
  CommandCardRendererPort,
  CommandCardStorage,
  UnitCardRendererPort,
  UnitCardStorage,
} from '@ports';
import { tempUnits } from '@classicalmoser/prevail-rules/sampleValues';

/**
 * A command-card storage whose every method is an unprogrammed mock.
 *
 * A use-case test overrides only the methods the case reads, so each case
 * shows which storage calls it depends on.
 *
 * @param overrides - Methods this test programs.
 * @returns A storage port made of `vi.fn` mocks.
 */
const commandCardStorageDouble = (
  overrides: Partial<CommandCardStorage> = {},
): CommandCardStorage => ({
  getCurrentCommandCards: vi.fn<CommandCardStorage['getCurrentCommandCards']>(),
  getAllCommandCards: vi.fn<CommandCardStorage['getAllCommandCards']>(),
  getCommandCardById: vi.fn<CommandCardStorage['getCommandCardById']>(),
  getCommandCardsByIds: vi.fn<CommandCardStorage['getCommandCardsByIds']>(),
  createEmptyCommandCard: vi.fn<CommandCardStorage['createEmptyCommandCard']>(),
  createCommandCardVersion:
    vi.fn<CommandCardStorage['createCommandCardVersion']>(),
  deleteCommandCardVersion:
    vi.fn<CommandCardStorage['deleteCommandCardVersion']>(),
  deleteEmptyCommandCards:
    vi.fn<CommandCardStorage['deleteEmptyCommandCards']>(),
  getLatestCommandCardCertifications:
    vi.fn<CommandCardStorage['getLatestCommandCardCertifications']>(),
  certifyCommandCardVersions:
    vi.fn<CommandCardStorage['certifyCommandCardVersions']>(),
  ...overrides,
});

/**
 * A unit-card storage whose every method is an unprogrammed mock.
 *
 * @param overrides - Methods this test programs.
 * @returns A storage port made of `vi.fn` mocks.
 */
const unitCardStorageDouble = (
  overrides: Partial<UnitCardStorage> = {},
): UnitCardStorage => ({
  getCurrentUnitCards: vi.fn<UnitCardStorage['getCurrentUnitCards']>(),
  getAllUnitCards: vi.fn<UnitCardStorage['getAllUnitCards']>(),
  getUnitCardById: vi.fn<UnitCardStorage['getUnitCardById']>(),
  getUnitCardsByIds: vi.fn<UnitCardStorage['getUnitCardsByIds']>(),
  createEmptyUnitCard: vi.fn<UnitCardStorage['createEmptyUnitCard']>(),
  createUnitCardVersion: vi.fn<UnitCardStorage['createUnitCardVersion']>(),
  deleteUnitCardVersion: vi.fn<UnitCardStorage['deleteUnitCardVersion']>(),
  deleteEmptyUnitCards: vi.fn<UnitCardStorage['deleteEmptyUnitCards']>(),
  getLatestUnitCardCertifications:
    vi.fn<UnitCardStorage['getLatestUnitCardCertifications']>(),
  certifyUnitCardVersions: vi.fn<UnitCardStorage['certifyUnitCardVersions']>(),
  ...overrides,
});

/**
 * A unit-card storage that finds every unit id asked for, naming it `Unit-<id>`.
 *
 * A command card names units by id and prints their names, so command-card
 * tests need the name lookup to succeed without caring which units exist.
 *
 * @param overrides - Methods this test programs instead.
 * @returns A storage port whose `getUnitCardsByIds` answers one unit per id.
 */
const namedUnitCardStorage = (
  overrides: Partial<UnitCardStorage> = {},
): UnitCardStorage => {
  const storage = unitCardStorageDouble({
    getUnitCardsByIds: vi
      .fn<UnitCardStorage['getUnitCardsByIds']>()
      .mockImplementation(async (ids) => ({
        success: true,
        data: ids.map((id) => ({ ...tempUnits[0], id, name: `Unit-${id}` })),
      })),
    ...overrides,
  });
  return storage;
};

/**
 * A command-card renderer that draws an empty SVG every time.
 *
 * @returns A renderer port whose render call succeeds.
 */
const stubCommandCardRenderer = (): CommandCardRendererPort => ({
  renderCommandCard: vi
    .fn<CommandCardRendererPort['renderCommandCard']>()
    .mockResolvedValue({ success: true, data: Buffer.from('<svg/>') }),
});

/**
 * A unit-card renderer that draws an empty SVG every time.
 *
 * @returns A renderer port whose render call succeeds.
 */
const stubUnitCardRenderer = (): UnitCardRendererPort => ({
  renderUnitCard: vi
    .fn<UnitCardRendererPort['renderUnitCard']>()
    .mockResolvedValue({ success: true, data: Buffer.from('<svg/>') }),
});

/**
 * An asset storage where every write succeeds and every object already exists.
 *
 * @returns An asset port made of `vi.fn` mocks.
 */
const stubAssetStorage = (): AssetStorage => ({
  putImmutable: vi
    .fn<AssetStorage['putImmutable']>()
    .mockResolvedValue({ kind: 'written' }),
  objectExists: vi.fn<AssetStorage['objectExists']>().mockResolvedValue(true),
});

export {
  commandCardStorageDouble,
  namedUnitCardStorage,
  stubAssetStorage,
  stubCommandCardRenderer,
  stubUnitCardRenderer,
  unitCardStorageDouble,
};
