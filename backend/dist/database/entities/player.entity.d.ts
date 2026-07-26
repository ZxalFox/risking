import { RoomEntity } from './room.entity';
import { RiskCard, MitigationCard } from '../../game/game.types';
export declare class PlayerEntity {
    id: string;
    nickname: string;
    isCreator: boolean;
    money: number;
    riskCards: RiskCard[];
    mitigationCards: MitigationCard[];
    room: RoomEntity;
}
