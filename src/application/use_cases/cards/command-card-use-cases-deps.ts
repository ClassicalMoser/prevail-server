import type {
  AssetStorage,
  CommandCardRendererPort,
  CommandCardStorage,
  UnitCardStorage,
} from '@ports';

/**
 * The ports the command-card use cases run on.
 *
 * Unit-card storage is here because a command card can name unit types, and
 * printing one needs their names.
 */
interface CommandCardUseCasesDeps {
  commandCardStorage: CommandCardStorage;
  unitCardStorage: UnitCardStorage;
  commandCardRenderer: CommandCardRendererPort;
  assetStorage: AssetStorage;
}

export type { CommandCardUseCasesDeps };
