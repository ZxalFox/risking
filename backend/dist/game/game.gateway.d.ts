import { OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
export declare class GameGateway implements OnGatewayDisconnect {
    private readonly gameService;
    server: Server;
    constructor(gameService: GameService);
    handleDisconnect(client: Socket): void;
    handleCreateRoom(client: Socket, data: {
        nickname: string;
    }): Promise<void>;
    handleJoinRoom(client: Socket, data: {
        roomId: string;
        nickname: string;
    }): Promise<void>;
    handleStartGame(client: Socket, data: {
        roomId: string;
    }): Promise<void>;
    handleLeaveRoom(client: Socket, data: {
        roomId: string;
    }): Promise<void>;
    handleAttack(client: Socket, data: {
        roomId: string;
        targetId: string;
        riskCardId: string;
    }): Promise<void>;
    handleDefend(client: Socket, data: {
        roomId: string;
        success: boolean;
        mitigationCardId?: string;
    }): Promise<void>;
}
