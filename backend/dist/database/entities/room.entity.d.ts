import { PlayerEntity } from './player.entity';
import { Room } from '../../game/game.types';
export declare class RoomEntity {
    id: string;
    status: string;
    currentRound: number;
    currentPlayerIndex: number;
    currentAttack: Room['currentAttack'];
    players: PlayerEntity[];
}
