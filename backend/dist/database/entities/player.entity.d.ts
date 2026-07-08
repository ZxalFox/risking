import { RoomEntity } from './room.entity';
export declare class PlayerEntity {
    id: string;
    nickname: string;
    money: number;
    riskCards: any[];
    mitigationCards: any[];
    room: RoomEntity;
}
