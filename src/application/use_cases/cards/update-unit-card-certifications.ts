import { unitTypeSchema } from '@classicalmoser/prevail-rules/domain';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { CertificationResults, DataErrorSignature } from '@ports';
import {
  allUnitCardAssetsExist,
  certifyCardVersions,
  ensureUnitCardProjection,
} from '@application/composable';
import type { UnitCardUseCasesDeps } from './unit-card-use-cases-deps';

/**
 * Certify every unit card that is ready, and report where the catalog stands.
 *
 * Certified cards are the ones players may build with. A card is ready when
 * its latest version passes the rules schema and has all its assets; missing
 * assets are drawn first. The result lists certified and uncertified card ids
 * after the write.
 *
 * @param deps - Unit-card storage, renderer, and asset ports.
 * @returns Certified and uncertified ids, or the first failure.
 */
const updateUnitCardCertifications = async (
  deps: UnitCardUseCasesDeps,
): Promise<DataErrorSignature<CertificationResults>> => {
  const projectionDeps = {
    assetStorage: deps.assetStorage,
    unitCardRenderer: deps.unitCardRenderer,
  };
  const results = await certifyCardVersions<UnitType, undefined>({
    getLatest: () => deps.unitCardStorage.getLatestUnitCardCertifications(),
    // A unit the schema rejects can never be played, so it is left uncertified.
    isSchemaValid: (card) => unitTypeSchema.safeParse(card).success,
    // Unit cards print without any lookup, so there is nothing to prepare.
    prepare: async () => ({ success: true, data: undefined }),
    allAssetsExist: (card) => allUnitCardAssetsExist(deps.assetStorage, card),
    ensureProjection: (card) => ensureUnitCardProjection(projectionDeps, card),
    certify: (ids) => deps.unitCardStorage.certifyUnitCardVersions(ids),
    cardId: (card) => card.id,
  });
  return results;
};

export { updateUnitCardCertifications };
