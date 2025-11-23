import { JwtPayload } from "../auth/strategies/jwt.strategy.js";
import { AttackTurnDto } from "./dto/attack-turn.dto.js";
import { CreateSessionDto } from "./dto/create-session.dto.js";
import { DefendTurnDto } from "./dto/defend-turn.dto.js";
import { JoinSessionDto } from "./dto/join-session.dto.js";
import { SessionsService } from "./sessions.service.js";
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    create(user: JwtPayload, dto: CreateSessionDto): Promise<import("./sessions.service.js").SessionState>;
    listActive(): Promise<import("./sessions.service.js").SessionState[]>;
    join(user: JwtPayload, id: string, dto: JoinSessionDto): Promise<import("./sessions.service.js").SessionState>;
    start(user: JwtPayload, id: string): Promise<import("./sessions.service.js").SessionState>;
    leave(user: JwtPayload, id: string): Promise<import("./sessions.service.js").SessionState>;
    state(id: string): Promise<import("./sessions.service.js").SessionState>;
    attack(user: JwtPayload, id: string, dto: AttackTurnDto): Promise<never>;
    defend(user: JwtPayload, id: string, dto: DefendTurnDto): Promise<never>;
}
