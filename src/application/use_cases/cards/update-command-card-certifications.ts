import { commandCardSchema } from '@classicalmoser/prevail-rules/domain';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { CertificationResults, DataErrorSignature } from '@ports';
import {
  allCommandCardAssetsExist,
  certifyCardVersions,
  ensureCommandCardProjection,
  prepareCommandCardProjection,
} from '@application/composable';
import type { CommandCardProjectionDeps } from '@application/composable';
import type { CommandCardUseCasesDeps } from './command-card-use-cases-deps';

/**
 * Certify every command card that is ready, and report where the catalog stands.
 *
 * Certified cards are the ones players may build with. A card is ready when
 * its latest version passes the rules schema and has all its assets; missing
 * assets are drawn first. The result lists certified and uncertified card ids
 * after the write.
 *
 * @param deps - Command-card and unit-card storage, renderer, and asset ports.
 * @returns Certified and uncertified ids, or the first failure.
 */
const updateCommandCardCertifications = async (
  deps: CommandCardUseCasesDeps,
): Promise<DataErrorSignature<CertificationResults>> => {
  const results = await certifyCardVersions<
    CommandCard,
    CommandCardProjectionDeps
  >({
    getLatest: () =>
      deps.commandCardStorage.getLatestCommandCardCertifications(),
    // A card the schema rejects can never be played, so it is left uncertified.
    isSchemaValid: (card) => commandCardSchema.safeParse(card).success,
    prepare: (statuses) => prepareCommandCardProjection(deps, statuses),
    allAssetsExist: (card) =>
      allCommandCardAssetsExist(deps.assetStorage, card),
    ensureProjection: (card, projectionDeps) =>
      ensureCommandCardProjection(projectionDeps, card),
    certify: (ids) => deps.commandCardStorage.certifyCommandCardVersions(ids),
    cardId: (card) => card.id,
  });
  return results;
};

export { updateCommandCardCertifications };
