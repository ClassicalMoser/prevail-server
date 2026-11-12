/** One `armies` row: identity, owner, and soft-archive stamp. */
interface ArmyDb {
  army_id: string;
  army_name: string;
  user_id: string;
  public: boolean;
  archived_at: Date | null;
}

/** The columns the army list needs; hydration loads the rest per army. */
interface ArmyListItemDb {
  army_id: string;
  army_name: string;
}

/** One `army_unit_cards` join row: a unit card id and how many of it. */
interface ArmyUnitCardDb {
  army_id: string;
  unit_card_id: string;
  quantity: number;
}

/** One `army_command_cards` join row: a command card id in an army. */
interface ArmyCommandCardDb {
  army_id: string;
  command_card_id: string;
  quantity: number;
}

export type { ArmyDb, ArmyListItemDb, ArmyUnitCardDb, ArmyCommandCardDb };
