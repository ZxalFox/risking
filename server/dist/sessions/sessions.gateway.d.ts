import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SessionsService } from "./sessions.service.js";
interface SessionChangePayload {
    sessionId: string;
}
export declare class SessionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly sessionsService;
    private readonly logger;
    private readonly accessSecret;
    server: Server;
    constructor(jwtService: JwtService, sessionsService: SessionsService, configService: ConfigService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleStateRequest(client: Socket, payload?: {
        sessionId?: string;
    }): Promise<void>;
    handleSessionChange(payload: SessionChangePayload): Promise<void>;
    private extractToken;
    private extractSessionId;
    private roomName;
}
export {};
