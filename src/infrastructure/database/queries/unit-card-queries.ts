import type {
  UnitCardCertificationStatusDb,
  UnitCardListItemDb,
  UnitCardVersionDb,
  WriteUnitCardVersionDb,
} from '../db-types';
import type { Sql } from '../sql-type';

const getCurrentUnitCardsQuery = async (
  sql: Sql,
): Promise<UnitCardVersionDb[]> =>
  await sql`WITH latest_rules AS (
    SELECT rules_version_id
    FROM rules_versions
    ORDER BY version_major DESC, version_minor DESC, version_patch DESC
    LIMIT 1
  )
  SELECT DISTINCT ON (uc.unit_card_id)
      uc.unit_card_id,
      ucv.unit_card_version_id,
      ucv.unit_card_name,
      ucv.unit_card_definition,
      ucv.version_major,
      ucv.version_minor,
      ucv.version_patch
    FROM unit_cards uc
    JOIN unit_card_versions ucv
      ON ucv.unit_card_id = uc.unit_card_id
    JOIN unit_card_certifications ucc
      ON ucc.unit_card_version_id = ucv.unit_card_version_id
    JOIN latest_rules lr
      ON lr.rules_version_id = ucc.rules_version_id
    ORDER BY
      uc.unit_card_id,
      ucv.version_major DESC,
      ucv.version_minor DESC,
      ucv.version_patch DESC`;

const getUnitCardByIdQuery = async (
  sql: Sql,
  unitCardId: string,
): Promise<UnitCardVersionDb[]> =>
  await sql`SELECT
      ucv.unit_card_id,
      ucv.unit_card_version_id,
      ucv.unit_card_name,
      ucv.unit_card_definition,
      ucv.version_major,
      ucv.version_minor,
      ucv.version_patch
    FROM unit_card_versions ucv
    WHERE ucv.unit_card_id = ${unitCardId}
    ORDER BY
      ucv.version_major DESC,
      ucv.version_minor DESC,
      ucv.version_patch DESC
    LIMIT 1`;

const getUnitCardsByIdsQuery = async (
  sql: Sql,
  unitCardIds: string[],
): Promise<UnitCardVersionDb[]> =>
  await sql`SELECT DISTINCT ON (ucv.unit_card_id)
      ucv.unit_card_id,
      ucv.unit_card_version_id,
      ucv.unit_card_name,
      ucv.unit_card_definition,
      ucv.version_major,
      ucv.version_minor,
      ucv.version_patch
    FROM unit_card_versions ucv
    WHERE ucv.unit_card_id = ANY(${unitCardIds})
    ORDER BY
      ucv.unit_card_id,
      ucv.version_major DESC,
      ucv.version_minor DESC,
      ucv.version_patch DESC`;

const getLatestUnitCardCertificationsQuery = async (
  sql: Sql,
): Promise<UnitCardCertificationStatusDb[]> =>
  await sql`WITH latest_rules AS (
    SELECT rules_version_id
    FROM rules_versions
    ORDER BY version_major DESC, version_minor DESC, version_patch DESC
    LIMIT 1
  )
  SELECT DISTINCT ON (uc.unit_card_id)
      uc.unit_card_id,
      ucv.unit_card_version_id,
      ucv.unit_card_name,
      ucv.unit_card_definition,
      ucv.version_major,
      ucv.version_minor,
      ucv.version_patch,
      (ucc.unit_card_version_id IS NOT NULL) AS certified
    FROM unit_cards uc
    JOIN unit_card_versions ucv
      ON ucv.unit_card_id = uc.unit_card_id
    LEFT JOIN latest_rules lr ON TRUE
    LEFT JOIN unit_card_certifications ucc
      ON ucc.unit_card_version_id = ucv.unit_card_version_id
      AND ucc.rules_version_id = lr.rules_version_id
    ORDER BY
      uc.unit_card_id,
      ucv.version_major DESC,
      ucv.version_minor DESC,
      ucv.version_patch DESC`;

const getAllUnitCardsQuery = async (sql: Sql): Promise<UnitCardListItemDb[]> =>
  await sql`SELECT
      uc.unit_card_id,
      latest.unit_card_name,
      latest.version_major,
      latest.version_minor,
      latest.version_patch
    FROM unit_cards uc
    LEFT JOIN (
      SELECT DISTINCT ON (unit_card_id)
        unit_card_id,
        unit_card_name,
        version_major,
        version_minor,
        version_patch
      FROM unit_card_versions
      ORDER BY
        unit_card_id,
        version_major DESC,
        version_minor DESC,
        version_patch DESC
    ) latest
      ON latest.unit_card_id = uc.unit_card_id
    ORDER BY
      uc.created_at DESC,
      uc.unit_card_id`;

const deleteEmptyUnitCardsQuery = async (sql: Sql): Promise<void> => {
  await sql`DELETE FROM unit_cards uc
    WHERE NOT EXISTS (
      SELECT 1
      FROM unit_card_versions ucv
      WHERE ucv.unit_card_id = uc.unit_card_id
    )`;
};

const createEmptyUnitCardQuery = async (
  sql: Sql,
): Promise<{ unit_card_id: string }[]> =>
  await sql`INSERT INTO unit_cards DEFAULT VALUES
    RETURNING unit_card_id`;

const unitCardExistsQuery = async (
  sql: Sql,
  unitCardId: string,
): Promise<{ unit_card_id: string }[]> =>
  await sql`SELECT unit_card_id
    FROM unit_cards
    WHERE unit_card_id = ${unitCardId}`;

const createUnitCardVersionQuery = async (
  sql: Sql,
  writeVersion: WriteUnitCardVersionDb,
): Promise<UnitCardVersionDb[]> =>
  await sql`INSERT INTO unit_card_versions (
      unit_card_id,
      unit_card_name,
      version_major,
      version_minor,
      version_patch,
      unit_card_definition
    )
    VALUES (
      ${writeVersion.unit_card_id},
      ${writeVersion.unit_card_name},
      ${writeVersion.version_major},
      ${writeVersion.version_minor},
      ${writeVersion.version_patch},
      ${writeVersion.unit_card_definition}
    )
    RETURNING unit_card_id,
              unit_card_version_id,
              unit_card_name,
              unit_card_definition,
              version_major,
              version_minor,
              version_patch`;

const insertUnitCardCertificationsQuery = async (
  sql: Sql,
  unitCardIds: string[],
  rulesVersionId: string,
): Promise<void> => {
  await sql`INSERT INTO unit_card_certifications (
      unit_card_version_id,
      rules_version_id
    )
    SELECT latest.unit_card_version_id, ${rulesVersionId}
    FROM (
      SELECT DISTINCT ON (unit_card_id) unit_card_version_id
      FROM unit_card_versions
      WHERE unit_card_id = ANY(${unitCardIds})
      ORDER BY
        unit_card_id,
        version_major DESC,
        version_minor DESC,
        version_patch DESC
    ) latest
    ON CONFLICT DO NOTHING`;
};

export {
  createEmptyUnitCardQuery,
  createUnitCardVersionQuery,
  deleteEmptyUnitCardsQuery,
  getAllUnitCardsQuery,
  getCurrentUnitCardsQuery,
  getLatestUnitCardCertificationsQuery,
  getUnitCardByIdQuery,
  getUnitCardsByIdsQuery,
  insertUnitCardCertificationsQuery,
  unitCardExistsQuery,
};
