import type { CatalogCardListItem } from '@ports';
import type { CommandCardListItemDb, UnitCardListItemDb } from '../db-types';
import { formatVersionTriple } from './version-mappers';

const commandCardListItemMapper = (
  row: CommandCardListItemDb,
): CatalogCardListItem => ({
  id: row.command_card_id,
  name: row.command_card_name,
  version:
    row.version_major === null
      ? row.version_major
      : formatVersionTriple({
          major: row.version_major,
          minor: row.version_minor ?? 0,
          patch: row.version_patch ?? 0,
        }),
});

const unitCardListItemMapper = (
  row: UnitCardListItemDb,
): CatalogCardListItem => ({
  id: row.unit_card_id,
  name: row.unit_card_name,
  version:
    row.version_major === null
      ? row.version_major
      : formatVersionTriple({
          major: row.version_major,
          minor: row.version_minor ?? 0,
          patch: row.version_patch ?? 0,
        }),
});

export { commandCardListItemMapper, unitCardListItemMapper };
