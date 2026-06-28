import { Player, Room } from './game.types';
export declare class GameService {
    private rooms;
    private readonly MOCK_MITIGATIONS;
    private readonly MOCK_RISK_CARDS;
    private readonly MOCK_MITIGATION_CARDS;
    createRoom(): string;
    getRoom(roomId: string): Room | undefined;
    joinRoom(roomId: string, player: Omit<Player, 'money' | 'riskCards' | 'mitigationCards'>): Room;
    leaveRoom(roomId: string, playerId: string): void;
    startGame(roomId: string): Room;
    attack(roomId: string, attackerId: string, targetId: string, riskCardId: string): Room;
    defend(roomId: string, targetId: string, success: boolean, mitigationCardId?: string): Room;
    private getRandomCards;
}
