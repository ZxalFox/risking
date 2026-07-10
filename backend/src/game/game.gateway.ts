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
    // For MVP we won't handle disconnect automatically yet.
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { nickname: string }) {
    try {
      const roomId = await this.gameService.createRoom();
      client.join(roomId);
      
      const room = await this.gameService.joinRoom(roomId, {
        id: client.id,
        nickname: data.nickname,
        isCreator: true
      });

      client.emit('roomCreated', { event: 'roomCreated', data: room });
    } catch (e: any) {
      client.emit('roomCreated', { event: 'error', data: e.message });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string, nickname: string }) {
    try {
      const room = await this.gameService.joinRoom(data.roomId, {
        id: client.id,
        nickname: data.nickname,
        isCreator: false
      });
      client.join(data.roomId);
      
      this.server.to(data.roomId).emit('roomUpdated', room);
      client.emit('roomJoined', { event: 'roomJoined', data: room });
    } catch (e: any) {
      client.emit('roomJoined', { event: 'error', data: e.message });
    }
  }

  @SubscribeMessage('startGame')
  async handleStartGame(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    try {
      const room = await this.gameService.startGame(data.roomId);
      this.server.to(data.roomId).emit('gameStarted', room);
    } catch (e: any) {
      client.emit('error', { data: e.message });
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    try {
      await this.gameService.leaveRoom(data.roomId, client.id);
      client.leave(data.roomId);
      
      const room = await this.gameService.getRoom(data.roomId);
      if (room) {
        this.server.to(data.roomId).emit('roomUpdated', room);
      }
    } catch (e: any) {
      client.emit('error', { data: e.message });
    }
  }

  @SubscribeMessage('attack')
  async handleAttack(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string, targetId: string, riskCardId: string }
  ) {
    try {
      const room = await this.gameService.attack(data.roomId, client.id, data.targetId, data.riskCardId);
      this.server.to(data.roomId).emit('attacked', room);
    } catch (e: any) {
      client.emit('error', { data: e.message });
    }
  }

  @SubscribeMessage('defend')
  async handleDefend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string, success: boolean, mitigationCardId?: string }
  ) {
    try {
      const room = await this.gameService.defend(data.roomId, client.id, data.success, data.mitigationCardId);
      this.server.to(data.roomId).emit('defenseResult', room);
    } catch (e: any) {
      client.emit('error', { data: e.message });
    }
  }
}
