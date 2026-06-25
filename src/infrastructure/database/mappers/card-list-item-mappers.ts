import type { CardListItem } from '@classicalmoser/prevail-contracts';
import type { CommandCardListItemDb, UnitCardListItemDb } from '../db-types';

const commandCardListItemMapper = (
  row: CommandCardListItemDb,
): CardListItem => ({
  id: row.command_card_id,
  name: row.command_card_name,
  version:
    row.version_major !== null
      ? `${row.version_major}.${row.version_minor}.${row.version_patch}`
      : row.version_major,
});

const unitCardListItemMapper = (row: UnitCardListItemDb): CardListItem => ({
  id: row.unit_card_id,
  name: row.unit_card_name,
  version:
    row.version_major !== null
      ? `${row.version_major}.${row.version_minor}.${row.version_patch}`
      : row.version_major,
});

export { commandCardListItemMapper, unitCardListItemMapper };
