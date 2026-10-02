import type { CertificationResults } from '@classicalmoser/prevail-contracts';
import type { DataErrorSignature } from '@ports';

interface CardCertificationStatus<TCard> {
  card: TCard;
  certified: boolean;
}

interface CertifyCardVersionsOps<TCard, TContext = undefined> {
  getLatest: () => Promise<
    DataErrorSignature<CardCertificationStatus<TCard>[]>
  >;
  isSchemaValid: (card: TCard) => boolean;
  /** Optional prep after schema filter (e.g. unit name map). Failure aborts. */
  prepare?: (
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

const certifyCardVersions = async <TCard, TContext = undefined>(
  ops: CertifyCardVersionsOps<TCard, TContext>,
): Promise<DataErrorSignature<CertificationResults>> => {
  const beforeResult = await ops.getLatest();
  if (!beforeResult.success) {
    return beforeResult;
  }

  const schemaValidStatuses = beforeResult.data
    .filter(({ certified }) => !certified)
    .filter(({ card }) => ops.isSchemaValid(card));

  let context = undefined as TContext;
  if (ops.prepare !== undefined) {
    const prepareResult = await ops.prepare(schemaValidStatuses);
    if (!prepareResult.success) {
      return prepareResult;
    }
    context = prepareResult.data;
  }

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
