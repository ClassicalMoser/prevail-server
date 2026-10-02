import type { DataErrorSignature, UnitCardStorage } from '@ports';
import type { UnitIdToNameMap } from './replace-command-card-ids-with-names';

const buildUnitIdToNameMap = async (
  unitCardStorage: UnitCardStorage,
  unitIds: string[],
): Promise<DataErrorSignature<UnitIdToNameMap>> => {
  if (unitIds.length === 0) {
    return { success: true, data: new Map() };
  }

  const uniqueIds = [...new Set(unitIds)];
  const result = await unitCardStorage.getUnitCardsByIds(uniqueIds);
  if (!result.success) {
    return result;
  }

  const map = new Map(result.data.map((unit) => [unit.id, unit.name]));
  for (const id of uniqueIds) {
    if (!map.has(id)) {
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
