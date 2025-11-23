import { EventEmitter2 } from "@nestjs/event-emitter";
import type { Session, SessionEvent, SessionPlayer } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { UsersService } from "../users/users.service.js";
import { CreateSessionDto } from "./dto/create-session.dto.js";
import { JoinSessionDto } from "./dto/join-session.dto.js";
import { AttackTurnDto } from "./dto/attack-turn.dto.js";
import { DefendTurnDto } from "./dto/defend-turn.dto.js";
export interface SessionState {
    session: Session;
    players: Array<SessionPlayer & {
        user: {
            id: string;
            displayName: string | null;
        } | null;
    }>;
    lastEvent?: SessionEvent | null;
}
export declare class SessionsService {
    private readonly prisma;
    private readonly usersService;
    private readonly events;
    constructor(prisma: PrismaService, usersService: UsersService, events: EventEmitter2);
    listActiveSessions(): Promise<SessionState[]>;
    createSession(userId: string, dto: CreateSessionDto): Promise<SessionState>;
    joinSession(userId: string, sessionId: string, dto: JoinSessionDto): Promise<SessionState>;
    startSession(userId: string, sessionId: string): Promise<SessionState>;
    getSessionState(sessionId: string): Promise<SessionState>;
    leaveSession(userId: string, sessionId: string): Promise<SessionState>;
    attackTurn(userId: string, sessionId: string, dto: AttackTurnDto): Promise<never>;
    defendTurn(userId: string, sessionId: string, dto: DefendTurnDto): Promise<never>;
    emitStateChange(sessionId: string): void;
    private mapState;
    private shuffle;
}
