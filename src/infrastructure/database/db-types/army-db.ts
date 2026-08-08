interface ArmyDb {
  army_id: string;
  army_name: string;
  user_id: string;
  public: boolean;
  archived_at: Date | null;
}

interface ArmyListItemDb {
  army_id: string;
  army_name: string;
}

interface ArmyUnitCardDb {
  army_id: string;
  unit_card_id: string;
  quantity: number;
}

interface ArmyCommandCardDb {
  army_id: string;
  command_card_id: string;
  quantity: number;
}

export type { ArmyDb, ArmyListItemDb, ArmyUnitCardDb, ArmyCommandCardDb };
