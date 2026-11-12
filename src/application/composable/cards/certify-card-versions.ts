import type { CertificationResults } from '@classicalmoser/prevail-contracts';
import type { DataErrorSignature } from '@ports';

/** A card version with whether it is already certified for army building. */
interface CardCertificationStatus<TCard> {
  card: TCard;
  /** True once the card may be used in an army. */
  certified: boolean;
}

/**
 * What certification needs from one catalog (command or unit) so the same
 * policy runs over both without knowing either's storage or renderer.
 */
interface CertifyCardVersionsOps<TCard, TContext> {
  /** The latest version of each card with whether it is certified yet. */
  getLatest: () => Promise<
    DataErrorSignature<CardCertificationStatus<TCard>[]>
  >;
  /** Whether the rules schema accepts the card; a rejected card is never certified. */
  isSchemaValid: (card: TCard) => boolean;
  /**
   * Prep after the schema filter (for example the unit name map), answering
   * the context the asset checks need. A catalog with nothing to prepare
   * answers `undefined`. A failure aborts the run.
   */
  prepare: (
    schemaValid: CardCertificationStatus<TCard>[],
  ) => Promise<DataErrorSignature<TContext>>;
  /** Whether every print and screen file for the card is already stored. */
  allAssetsExist: (card: TCard, context: TContext) => Promise<boolean>;
  /** Draws only the files still missing, healing an interrupted publish. */
  ensureProjection: (
    card: TCard,
    context: TContext,
  ) => Promise<DataErrorSignature<void>>;
  /** Stamps these card ids so players may put them in an army. */
  certify: (ids: string[]) => Promise<DataErrorSignature<void>>;
  /** The id the certify write and the result lists use for this card. */
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

  // Already-certified cards are left alone, and a card the rules schema rejects
  // is never a candidate: certified means players may put it in an army.
  const schemaValidStatuses = beforeResult.data
    .filter(({ certified }) => !certified)
    .filter(({ card }) => ops.isSchemaValid(card));

  // What the asset checks need to know (for example unit names to print).
  const prepareResult = await ops.prepare(schemaValidStatuses);
  if (!prepareResult.success) {
    return prepareResult;
  }
  const context = prepareResult.data;

  // Heal first: a card whose assets are missing (an interrupted publish) gets
  // them drawn now, so it is not held back from certification for good.
  for (const entry of schemaValidStatuses) {
    if (!(await ops.allAssetsExist(entry.card, context))) {
      const healResult = await ops.ensureProjection(entry.card, context);
      if (!healResult.success) {
        return healResult;
      }
    }
  }

  // Re-check after healing: a card is certified only if every asset is really
  // there, because a card nobody can print must not reach an army.
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

  // Report from storage, not from our own list, so the author sees the true
  // catalog state including cards certified before this run.
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
