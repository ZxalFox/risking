export type RiskCategory = string;
export interface Mitigation {
    id: string;
    description: string;
}
export interface RiskCard {
    id: string;
    categoryId: RiskCategory;
    descriptionId: string;
    mitigations?: Mitigation[];
}
export interface MitigationCard {
    id: string;
    categoryId: RiskCategory;
    mitigations?: Mitigation[];
}
export interface Player {
    id: string;
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
        timeout?: any;
    };
}
