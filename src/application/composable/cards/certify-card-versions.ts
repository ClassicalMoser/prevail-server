import type { CertificationResults } from '@classicalmoser/prevail-contracts';
import type { DataErrorSignature } from '@ports';

interface CardCertificationStatus<TCard> {
  card: TCard;
  certified: boolean;
}

interface CertifyCardVersionsOps<TCard, TContext> {
  getLatest: () => Promise<
    DataErrorSignature<CardCertificationStatus<TCard>[]>
  >;
  isSchemaValid: (card: TCard) => boolean;
  /**
   * Prep after the schema filter (for example the unit name map), answering
   * the context the asset checks need. A catalog with nothing to prepare
   * answers `undefined`. A failure aborts the run.
   */
  prepare: (
    schemaValid: CardCertificationStatus<TCard>[],
  ) => Promise<DataErrorSignature<TContext>>;
  allAssetsExist: (card: TCard, context: TContext) => Promise<boolean>;
  ensureProjection: (
    card: TCard,
    context: TContext,
  ) => Promise<DataErrorSignature<void>>;
  certify: (ids: string[]) => Promise<DataErrorSignature<void>>;
  cardId: (card: TCard) => string;
}

/**
 * Certify uncertified card versions whose schema and assets are ready.
 *
 * Uncertified rows are filtered through the schema check, prepared
 * (for example a unit-name map), then healed when assets are missing. Only
 * cards that still have every asset after heal are stamped. The returned lists
 * come from a fresh `getLatest` so callers see the post-write certification
 * state by entity id.
 *
 * @param ops - Storage, schema, projection, and certify callbacks for one catalog.
 * @returns Certified and uncertified id lists after the write, or the first failure.
 */
const certifyCardVersions = async <TCard, TContext>(
  ops: CertifyCardVersionsOps<TCard, TContext>,
): Promise<DataErrorSignature<CertificationResults>> => {
  const beforeResult = await ops.getLatest();
  if (!beforeResult.success) {
    return beforeResult;
  }

  const schemaValidStatuses = beforeResult.data
    .filter(({ certified }) => !certified)
    .filter(({ card }) => ops.isSchemaValid(card));

  // What the asset checks need to know (for example unit names to print).
  const prepareResult = await ops.prepare(schemaValidStatuses);
  if (!prepareResult.success) {
    return prepareResult;
  }
  const context = prepareResult.data;

  for (const entry of schemaValidStatuses) {
    if (!(await ops.allAssetsExist(entry.card, context))) {
      const healResult = await ops.ensureProjection(entry.card, context);
      if (!healResult.success) {
        return healResult;
      }
    }
  }

  const readyToCertify: string[] = [];
  for (const { card } of schemaValidStatuses) {
    if (await ops.allAssetsExist(card, context)) {
      readyToCertify.push(ops.cardId(card));
    }
  }

  const certifyResult = await ops.certify(readyToCertify);
  if (!certifyResult.success) {
    return certifyResult;
  }

  const afterResult = await ops.getLatest();
  if (!afterResult.success) {
    return afterResult;
  }

  return {
    success: true,
    data: {
      certified: afterResult.data
        .filter((status) => status.certified)
        .map(({ card }) => ops.cardId(card)),
      uncertified: afterResult.data
        .filter((status) => !status.certified)
        .map(({ card }) => ops.cardId(card)),
    },
  };
};

export type { CardCertificationStatus, CertifyCardVersionsOps };
export { certifyCardVersions };
