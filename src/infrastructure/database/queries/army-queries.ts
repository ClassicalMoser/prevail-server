import type {
  ArmyCommandCardDb,
  ArmyDb,
  ArmyListItemDb,
  ArmyUnitCardDb,
} from '../db-types';
import type { Sql } from '../sql-type';

const getOwnedArmiesQuery = async (
  sql: Sql,
  authSub: string,
): Promise<ArmyListItemDb[]> =>
  await sql`
    SELECT a.army_id, a.army_name
    FROM armies a
    JOIN users u ON u.user_id = a.user_id
    WHERE u.user_auth_sub = ${authSub}
      AND a.archived_at IS NULL
    ORDER BY a.created_at DESC
  `;

const getOwnedArmyRowQuery = async (
  sql: Sql,
  authSub: string,
  armyId: string,
): Promise<ArmyDb[]> =>
  await sql`
    SELECT a.army_id, a.army_name, a.user_id, a.public, a.archived_at
    FROM armies a
    JOIN users u ON u.user_id = a.user_id
    WHERE a.army_id = ${armyId}
      AND u.user_auth_sub = ${authSub}
      AND a.archived_at IS NULL
    LIMIT 1
  `;

const getArmyUnitCardsQuery = async (
  sql: Sql,
  armyId: string,
): Promise<ArmyUnitCardDb[]> =>
  await sql`
    SELECT army_id, unit_card_id, quantity
    FROM army_unit_cards
    WHERE army_id = ${armyId}
  `;

const getArmyCommandCardsQuery = async (
  sql: Sql,
  armyId: string,
): Promise<ArmyCommandCardDb[]> =>
  await sql`
    SELECT army_id, command_card_id, quantity
    FROM army_command_cards
    WHERE army_id = ${armyId}
  `;

const createArmyQuery = async (
  sql: Sql,
  params: {
    userId: string;
    armyName: string;
  },
): Promise<ArmyDb[]> =>
  await sql`
    INSERT INTO armies (user_id, army_name)
    VALUES (${params.userId}, ${params.armyName})
    RETURNING army_id, army_name, user_id, public, archived_at
  `;

const updateArmyQuery = async (
  sql: Sql,
  params: {
    armyId: string;
    userId: string;
    armyName: string;
  },
): Promise<ArmyDb[]> =>
  await sql`
    UPDATE armies
    SET army_name = ${params.armyName}
    WHERE army_id = ${params.armyId}
      AND user_id = ${params.userId}
      AND archived_at IS NULL
    RETURNING army_id, army_name, user_id, public, archived_at
  `;

const deleteArmyUnitCardsQuery = async (
  sql: Sql,
  armyId: string,
): Promise<void> => {
  await sql`DELETE FROM army_unit_cards WHERE army_id = ${armyId}`;
};

const deleteArmyCommandCardsQuery = async (
  sql: Sql,
  armyId: string,
): Promise<void> => {
  await sql`DELETE FROM army_command_cards WHERE army_id = ${armyId}`;
};

const insertArmyUnitCardQuery = async (
  sql: Sql,
  row: ArmyUnitCardDb,
): Promise<void> => {
  await sql`
    INSERT INTO army_unit_cards (army_id, unit_card_id, quantity)
    VALUES (${row.army_id}, ${row.unit_card_id}, ${row.quantity})
  `;
};

const insertArmyCommandCardQuery = async (
  sql: Sql,
  row: ArmyCommandCardDb,
): Promise<void> => {
  await sql`
    INSERT INTO army_command_cards (army_id, command_card_id, quantity)
    VALUES (${row.army_id}, ${row.command_card_id}, ${row.quantity})
  `;
};

const archiveArmyQuery = async (
  sql: Sql,
  authSub: string,
  armyId: string,
): Promise<{ army_id: string }[]> =>
  await sql`
    UPDATE armies a
    SET archived_at = now()
    FROM users u
    WHERE a.army_id = ${armyId}
      AND a.user_id = u.user_id
      AND u.user_auth_sub = ${authSub}
      AND a.archived_at IS NULL
    RETURNING a.army_id
  `;

export {
  archiveArmyQuery,
  createArmyQuery,
  deleteArmyCommandCardsQuery,
  deleteArmyUnitCardsQuery,
  getArmyCommandCardsQuery,
  getArmyUnitCardsQuery,
  getOwnedArmiesQuery,
  getOwnedArmyRowQuery,
  insertArmyCommandCardQuery,
  insertArmyUnitCardQuery,
  updateArmyQuery,
};
