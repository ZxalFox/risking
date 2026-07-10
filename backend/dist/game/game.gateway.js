"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const game_service_1 = require("./game.service");
let GameGateway = class GameGateway {
    constructor(gameService) {
        this.gameService = gameService;
    }
    handleDisconnect(client) {
    }
    async handleCreateRoom(client, data) {
        try {
            const roomId = await this.gameService.createRoom();
            client.join(roomId);
            const room = await this.gameService.joinRoom(roomId, {
                id: client.id,
                nickname: data.nickname,
                isCreator: true
            });
            client.emit('roomCreated', { event: 'roomCreated', data: room });
        }
        catch (e) {
            client.emit('roomCreated', { event: 'error', data: e.message });
        }
    }
    async handleJoinRoom(client, data) {
        try {
            const room = await this.gameService.joinRoom(data.roomId, {
                id: client.id,
                nickname: data.nickname,
                isCreator: false
            });
            client.join(data.roomId);
            this.server.to(data.roomId).emit('roomUpdated', room);
            client.emit('roomJoined', { event: 'roomJoined', data: room });
        }
        catch (e) {
            client.emit('roomJoined', { event: 'error', data: e.message });
        }
    }
    async handleStartGame(client, data) {
        try {
            const room = await this.gameService.startGame(data.roomId);
            this.server.to(data.roomId).emit('gameStarted', room);
        }
        catch (e) {
            client.emit('error', { data: e.message });
        }
    }
    async handleLeaveRoom(client, data) {
        try {
            await this.gameService.leaveRoom(data.roomId, client.id);
            client.leave(data.roomId);
            const room = await this.gameService.getRoom(data.roomId);
            if (room) {
                this.server.to(data.roomId).emit('roomUpdated', room);
            }
        }
        catch (e) {
            client.emit('error', { data: e.message });
        }
    }
    async handleAttack(client, data) {
        try {
            const room = await this.gameService.attack(data.roomId, client.id, data.targetId, data.riskCardId);
            this.server.to(data.roomId).emit('attacked', room);
        }
        catch (e) {
            client.emit('error', { data: e.message });
        }
    }
    async handleDefend(client, data) {
        try {
            const room = await this.gameService.defend(data.roomId, client.id, data.success, data.mitigationCardId);
            this.server.to(data.roomId).emit('defenseResult', room);
        }
        catch (e) {
            client.emit('error', { data: e.message });
        }
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('createRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleCreateRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('startGame'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleStartGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('attack'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleAttack", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('defend'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "handleDefend", null);
exports.GameGateway = GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' } }),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameGateway);
//# sourceMappingURL=game.gateway.js.map