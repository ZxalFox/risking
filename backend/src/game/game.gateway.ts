import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  handleDisconnect(client: Socket) {
    // Ideally we track which room the client was in and handle disconnection
    // For MVP, we'll keep it simple and the frontend will re-join or handle UI disconnects.
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { nickname: string }) {
    try {
      const roomId = this.gameService.createRoom();
      client.join(roomId);
      
      const room = this.gameService.joinRoom(roomId, {
        id: client.id,
        nickname: data.nickname,
        isCreator: true
      });

      return { event: 'roomCreated', data: room };
    } catch (e: any) {
      return { event: 'error', data: e.message };
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string, nickname: string }) {
    try {
      const room = this.gameService.joinRoom(data.roomId, {
        id: client.id,
        nickname: data.nickname,
        isCreator: false
      });
      client.join(data.roomId);
      
      // Notify others in room
      this.server.to(data.roomId).emit('roomUpdated', room);
      return { event: 'roomJoined', data: room };
    } catch (e: any) {
      return { event: 'error', data: e.message };
    }
  }

  @SubscribeMessage('startGame')
  handleStartGame(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    try {
      const room = this.gameService.startGame(data.roomId);
      this.server.to(data.roomId).emit('gameStarted', room);
      return { event: 'success' };
    } catch (e: any) {
      return { event: 'error', data: e.message };
    }
  }

  @SubscribeMessage('attack')
  handleAttack(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string, targetId: string, riskCardId: string }
  ) {
    try {
      const room = this.gameService.attack(data.roomId, client.id, data.targetId, data.riskCardId);
      this.server.to(data.roomId).emit('attacked', room);
      return { event: 'success' };
    } catch (e: any) {
      return { event: 'error', data: e.message };
    }
  }

  @SubscribeMessage('defend')
  handleDefend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string, success: boolean, mitigationCardId?: string }
  ) {
    try {
      const room = this.gameService.defend(data.roomId, client.id, data.success, data.mitigationCardId);
      this.server.to(data.roomId).emit('defenseResult', room);
      return { event: 'success' };
    } catch (e: any) {
      return { event: 'error', data: e.message };
    }
  }
}
