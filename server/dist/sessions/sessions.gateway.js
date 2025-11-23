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
var SessionsGateway_1;
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SessionsService } from "./sessions.service.js";
let SessionsGateway = SessionsGateway_1 = class SessionsGateway {
    jwtService;
    sessionsService;
    logger = new Logger(SessionsGateway_1.name);
    accessSecret;
    server;
    constructor(jwtService, sessionsService, configService) {
        this.jwtService = jwtService;
        this.sessionsService = sessionsService;
        this.accessSecret = configService.get("JWT_SECRET", "change-me");
    }
    async handleConnection(client) {
        try {
            const token = this.extractToken(client);
            const sessionId = this.extractSessionId(client);
            if (!token || !sessionId) {
                throw new Error("Missing token or sessionId");
            }
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.accessSecret,
            });
            const state = await this.sessionsService.getSessionState(sessionId);
            const isParticipant = state.players.some((player) => player.userId === payload.sub);
            if (!isParticipant) {
                throw new Error("User not part of the session");
            }
            client.data.user = payload;
            client.data.sessionId = sessionId;
            client.join(this.roomName(sessionId));
            client.emit("session:state", state);
            this.logger.log(`Client connected: ${payload.sub} -> ${sessionId}`);
        }
        catch (error) {
            this.logger.warn(`Disconnecting client: ${error.message}`);
            client.emit("error", "Unauthorized");
            client.disconnect(true);
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.data?.user?.sub ?? "unknown"}`);
    }
    async handleStateRequest(client, payload) {
        const sessionId = payload?.sessionId ?? client.data.sessionId;
        if (!sessionId) {
            return;
        }
        const state = await this.sessionsService.getSessionState(sessionId);
        client.emit("session:state", state);
    }
    async handleSessionChange(payload) {
        const { sessionId } = payload;
        try {
            const state = await this.sessionsService.getSessionState(sessionId);
            this.server.to(this.roomName(sessionId)).emit("session:state", state);
        }
        catch (error) {
            this.logger.error(`Failed to broadcast state for ${sessionId}: ${error.message}`);
        }
    }
    extractToken(client) {
        const authHeader = client.handshake.headers.authorization;
        if (authHeader?.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        if (typeof client.handshake.auth?.token === "string") {
            return client.handshake.auth.token;
        }
        if (typeof client.handshake.query?.token === "string") {
            return client.handshake.query.token;
        }
        return undefined;
    }
    extractSessionId(client) {
        if (typeof client.handshake.auth?.sessionId === "string") {
            return client.handshake.auth.sessionId;
        }
        const queryValue = client.handshake.query?.sessionId;
        if (typeof queryValue === "string") {
            return queryValue;
        }
        return undefined;
    }
    roomName(sessionId) {
        return `session:${sessionId}`;
    }
};
__decorate([
    WebSocketServer(),
    __metadata("design:type", Server)
], SessionsGateway.prototype, "server", void 0);
__decorate([
    SubscribeMessage("session:state:request"),
    __param(0, ConnectedSocket()),
    __param(1, MessageBody()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Socket, Object]),
    __metadata("design:returntype", Promise)
], SessionsGateway.prototype, "handleStateRequest", null);
__decorate([
    OnEvent("session.state.changed"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SessionsGateway.prototype, "handleSessionChange", null);
SessionsGateway = SessionsGateway_1 = __decorate([
    WebSocketGateway({ namespace: "/sessions", cors: { origin: "*" } }),
    Injectable(),
    __metadata("design:paramtypes", [JwtService,
        SessionsService,
        ConfigService])
], SessionsGateway);
export { SessionsGateway };
//# sourceMappingURL=sessions.gateway.js.map