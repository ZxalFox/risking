
export interface Mitigation {
  id: string;
  description: string;
}

export interface RiskCard {
  id: string;
  categoryId: string;
  descriptionId: string;
  mitigations?: Mitigation[];
}

export interface MitigationCard {
  id: string;
  categoryId: string;
  mitigations?: Mitigation[];
}

export interface Player {
  id: string; // socket id
  nickname: string;
  money: number;
  riskCards: RiskCard[];
  mitigationCards: MitigationCard[];
  isCreator: boolean;
}

export interface Room {
  id: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  currentRound: number;
  currentPlayerIndex: number;
  currentAttack?: {
    attackerId: string;
    targetId: string;
    riskCard: RiskCard;
    timeout?: number | NodeJS.Timeout;
    proposedMitigation?: string;
  };
}
