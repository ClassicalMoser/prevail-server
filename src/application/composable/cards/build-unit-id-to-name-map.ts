import type { DataErrorSignature, UnitCardStorage } from '@ports';
import type { UnitIdToNameMap } from './print/unit-id-to-name-map';

/**
 * Load display names for the unit type ids referenced on a command card.
 *
 * Deduplicates the id list before the storage round trip. A missing id is a
 * 404 so the print pipeline does not invent placeholder names for live cards.
 *
 * @param unitCardStorage - Catalog unit storage.
 * @param unitIds - Unit type ids collected from a command card.
 * @returns A map from unit id to name, or a storage/404 failure.
 */
const buildUnitIdToNameMap = async (
  unitCardStorage: UnitCardStorage,
  unitIds: string[],
): Promise<DataErrorSignature<UnitIdToNameMap>> => {
  // Most command cards name no unit type; skip the storage round trip then.
  if (unitIds.length === 0) {
    return { success: true, data: new Map() };
  }

  const uniqueIds = [...new Set(unitIds)];
  const result = await unitCardStorage.getUnitCardsByIds(uniqueIds);
  if (!result.success) {
    return result;
  }

  // Storage silently omits unknown ids, so absence is detected below.
  const map = new Map(result.data.map((unit) => [unit.id, unit.name]));
  for (const id of uniqueIds) {
    if (!map.has(id)) {
      // A card pointing at a unit that does not exist cannot be printed
      // truthfully, so publishing or certifying it must fail.
      return {
        success: false,
        message: `Unit card not found: ${id}`,
        status: 404,
      };
    }
  }

  return { success: true, data: map };
};

export { buildUnitIdToNameMap };
