export type RiskCategory = '1. Tarefa' | '2. Estrutura' | '3. Ator' | '4. Tecnologia' | '5. Tarefa-Ator' | '6. Tarefa-Tecnologia' | '7. Estrutura-Tarefas' | '8. Ator-Tecnologia' | '9. Ator-Estrutura' | '10. Estrutura-Tecnologia';
export interface Mitigation {
    id: string;
    description: string;
}
export interface RiskCard {
    id: string;
    category: RiskCategory;
    description: string;
    mitigations: Mitigation[];
}
export interface MitigationCard {
    id: string;
    category: RiskCategory;
    mitigations: Mitigation[];
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
