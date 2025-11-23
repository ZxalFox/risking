import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtPayload } from "../auth/strategies/jwt.strategy.js";
import { SessionsService } from "./sessions.service.js";

interface SessionChangePayload {
  sessionId: string;
}

@WebSocketGateway({ namespace: "/sessions", cors: { origin: "*" } })
@Injectable()
export class SessionsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SessionsGateway.name);
  private readonly accessSecret: string;

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
    configService: ConfigService
  ) {
    this.accessSecret = configService.get<string>("JWT_SECRET", "change-me");
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      const sessionId = this.extractSessionId(client);
      if (!token || !sessionId) {
        throw new Error("Missing token or sessionId");
      }

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.accessSecret,
      });

      const state = await this.sessionsService.getSessionState(sessionId);
      const isParticipant = state.players.some(
        (player) => player.userId === payload.sub
      );
      if (!isParticipant) {
        throw new Error("User not part of the session");
      }

      client.data.user = payload;
      client.data.sessionId = sessionId;
      client.join(this.roomName(sessionId));
      client.emit("session:state", state);
      this.logger.log(`Client connected: ${payload.sub} -> ${sessionId}`);
    } catch (error) {
      this.logger.warn(`Disconnecting client: ${(error as Error).message}`);
      client.emit("error", "Unauthorized");
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(
      `Client disconnected: ${client.data?.user?.sub ?? "unknown"}`
    );
  }

  @SubscribeMessage("session:state:request")
  async handleStateRequest(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload?: { sessionId?: string }
  ) {
    const sessionId = payload?.sessionId ?? client.data.sessionId;
    if (!sessionId) {
      return;
    }
    const state = await this.sessionsService.getSessionState(sessionId);
    client.emit("session:state", state);
  }

  @OnEvent("session.state.changed")
  async handleSessionChange(payload: SessionChangePayload) {
    const { sessionId } = payload;
    try {
      const state = await this.sessionsService.getSessionState(sessionId);
      this.server.to(this.roomName(sessionId)).emit("session:state", state);
    } catch (error) {
      this.logger.error(
        `Failed to broadcast state for ${sessionId}: ${
          (error as Error).message
        }`
      );
    }
  }

  private extractToken(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
    if (typeof client.handshake.auth?.token === "string") {
      return client.handshake.auth.token;
    }
    if (typeof client.handshake.query?.token === "string") {
      return client.handshake.query.token as string;
    }
    return undefined;
  }

  private extractSessionId(client: Socket): string | undefined {
    if (typeof client.handshake.auth?.sessionId === "string") {
      return client.handshake.auth.sessionId;
    }
    const queryValue = client.handshake.query?.sessionId;
    if (typeof queryValue === "string") {
      return queryValue;
    }
    return undefined;
  }

  private roomName(sessionId: string) {
    return `session:${sessionId}`;
  }
}
