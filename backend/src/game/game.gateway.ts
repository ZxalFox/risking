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

  private clientToPlayer = new Map<string, string>();

  constructor(private readonly gameService: GameService) {}

  handleDisconnect(client: Socket) {
    this.clientToPlayer.delete(client.id);
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { nickname: string }) {
    try {
      const roomId = await this.gameService.createRoom();
      client.join(roomId);
      
      const { room, player } = await this.gameService.joinRoom(roomId, {
        id: client.id,
        nickname: data.nickname,
        isCreator: true
      });
      this.clientToPlayer.set(client.id, player.id);

      client.emit('roomCreated', { event: 'roomCreated', data: room, playerId: player.id });
    } catch (e: any) {
      client.emit('roomCreated', { event: 'error', data: e.message });
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string, nickname: string }) {
    try {
      const { room, player } = await this.gameService.joinRoom(data.roomId, {
        id: client.id,
        nickname: data.nickname,
        isCreator: false
      });
      this.clientToPlayer.set(client.id, player.id);
      client.join(data.roomId);
      
      this.server.to(data.roomId).emit('roomUpdated', room);
      client.emit('roomJoined', { event: 'roomJoined', data: room, playerId: player.id });
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
      const playerId = this.clientToPlayer.get(client.id) || client.id;
      await this.gameService.leaveRoom(data.roomId, playerId);
      this.clientToPlayer.delete(client.id);
      client.leave(data.roomId);
      
      const room = await this.gameService.getRoom(data.roomId);
      if (room) {
        this.server.to(data.roomId).emit('roomUpdated', room);
      }
    } catch (e: any) {
      client.emit('error', { data: e.message });
    }
  }

  @SubscribeMessage('endGame')
  async handleEndGame(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    try {
      const playerId = this.clientToPlayer.get(client.id) || client.id;
      const room = await this.gameService.endGame(data.roomId, playerId);
      this.server.to(data.roomId).emit('roomUpdated', room);
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
      const playerId = this.clientToPlayer.get(client.id) || client.id;
      const room = await this.gameService.attack(data.roomId, playerId, data.targetId, data.riskCardId);
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
      const playerId = this.clientToPlayer.get(client.id) || client.id;
      const room = await this.gameService.defend(data.roomId, playerId, data.success, data.mitigationCardId);
      this.server.to(data.roomId).emit('defenseResult', room);
    } catch (e: any) {
      client.emit('error', { data: e.message });
    }
  }
}
