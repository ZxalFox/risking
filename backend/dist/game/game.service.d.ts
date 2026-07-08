import { Repository } from 'typeorm';
import { RoomEntity } from '../database/entities/room.entity';
import { PlayerEntity } from '../database/entities/player.entity';
import { Player } from './game.types';
export declare class GameService {
    private readonly roomRepo;
    private readonly playerRepo;
    constructor(roomRepo: Repository<RoomEntity>, playerRepo: Repository<PlayerEntity>);
    private readonly MOCK_MITIGATIONS;
    private readonly MOCK_RISK_CARDS;
    private readonly MOCK_MITIGATION_CARDS;
    createRoom(): Promise<string>;
    getRoom(roomId: string): Promise<RoomEntity | null>;
    joinRoom(roomId: string, player: Omit<Player, 'money' | 'riskCards' | 'mitigationCards'>): Promise<RoomEntity>;
    leaveRoom(roomId: string, playerId: string): Promise<void>;
    startGame(roomId: string): Promise<RoomEntity>;
    attack(roomId: string, attackerId: string, targetId: string, riskCardId: string): Promise<RoomEntity>;
    defend(roomId: string, targetId: string, success: boolean, mitigationCardId?: string): Promise<RoomEntity>;
    private getRandomCards;
}
