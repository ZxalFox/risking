import { PlayerEntity } from './player.entity';
export declare class RoomEntity {
    id: string;
    status: string;
    currentRound: number;
    currentPlayerIndex: number;
    currentAttack: any;
    players: PlayerEntity[];
}
