var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, ForbiddenException, Injectable, NotFoundException, NotImplementedException, } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CardType, SessionStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service.js";
import { UsersService } from "../users/users.service.js";
let SessionsService = class SessionsService {
    prisma;
    usersService;
    events;
    constructor(prisma, usersService, events) {
        this.prisma = prisma;
        this.usersService = usersService;
        this.events = events;
    }
    async listActiveSessions() {
        const sessions = await this.prisma.session.findMany({
            where: { status: SessionStatus.lobby },
            include: {
                players: {
                    include: { user: { select: { id: true, displayName: true } } },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return sessions.map((session) => this.mapState(session));
    }
    async createSession(userId, dto) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }
        const maxPlayers = dto.maxPlayers ?? 5;
        const roundCount = dto.roundCount ?? 4;
        if (maxPlayers < 3 || maxPlayers > 5) {
            throw new BadRequestException("maxPlayers must be between 3 and 5");
        }
        const session = await this.prisma.session.create({
            data: {
                hostId: userId,
                maxPlayers,
                roundCount,
                players: {
                    create: {
                        userId,
                        joinOrder: 0,
                        moneyBalance: 30,
                        connected: true,
                    },
                },
                events: {
                    create: {
                        type: "session_created",
                        payload: {
                            hostId: userId,
                            locale: dto.locale ?? user.locale ?? "pt-BR",
                        },
                    },
                },
            },
            include: {
                players: {
                    include: { user: { select: { id: true, displayName: true } } },
                    orderBy: { joinOrder: "asc" },
                },
                events: { orderBy: { createdAt: "desc" }, take: 1 },
            },
        });
        this.emitStateChange(session.id);
        return this.mapState(session);
    }
    async joinSession(userId, sessionId, dto) {
        if (dto.asSpectator) {
            throw new BadRequestException("Spectator mode is not yet supported");
        }
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: { players: true },
        });
        if (!session) {
            throw new NotFoundException("Session not found");
        }
        if (session.status !== SessionStatus.lobby) {
            throw new BadRequestException("Session is not joinable");
        }
        const existing = session.players.find((p) => p.userId === userId);
        if (existing) {
            throw new BadRequestException("User already joined");
        }
        if (session.players.length >= session.maxPlayers) {
            throw new BadRequestException("Session is full");
        }
        const updated = await this.prisma.session.update({
            where: { id: sessionId },
            data: {
                players: {
                    create: {
                        userId,
                        joinOrder: session.players.length,
                        moneyBalance: 30,
                        connected: true,
                    },
                },
                events: {
                    create: {
                        type: "player_join",
                        payload: { userId },
                    },
                },
            },
            include: {
                players: {
                    include: { user: { select: { id: true, displayName: true } } },
                    orderBy: { joinOrder: "asc" },
                },
                events: { orderBy: { createdAt: "desc" }, take: 1 },
            },
        });
        this.emitStateChange(sessionId);
        return this.mapState(updated);
    }
    async startSession(userId, sessionId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                players: {
                    orderBy: { joinOrder: "asc" },
                },
            },
        });
        if (!session) {
            throw new NotFoundException("Session not found");
        }
        if (session.hostId !== userId) {
            throw new ForbiddenException("Only host can start the session");
        }
        if (session.status !== SessionStatus.lobby) {
            throw new BadRequestException("Session already started");
        }
        if (session.players.length < 3) {
            throw new BadRequestException("At least 3 players are required to start");
        }
        const firstPlayer = session.players.reduce((prev, current) => current.joinOrder < prev.joinOrder ? current : prev);
        // Prepare deck if cards are available, otherwise keep tables empty
        const cards = await this.prisma.card.findMany({
            select: { id: true, type: true },
        });
        const riskCardIds = this.shuffle(cards.filter((card) => card.type === CardType.risk).map((card) => card.id));
        const mitigationCardIds = this.shuffle(cards
            .filter((card) => card.type === CardType.mitigation)
            .map((card) => card.id));
        await this.prisma.$transaction([
            this.prisma.sessionDeck.upsert({
                where: { sessionId },
                update: {
                    riskOrder: riskCardIds,
                    mitigationOrder: mitigationCardIds,
                    drawPointers: { risk: 0, mitigation: 0 },
                },
                create: {
                    sessionId,
                    riskOrder: riskCardIds,
                    mitigationOrder: mitigationCardIds,
                    drawPointers: { risk: 0, mitigation: 0 },
                },
            }),
            this.prisma.session.update({
                where: { id: sessionId },
                data: {
                    status: SessionStatus.in_progress,
                    currentRound: 1,
                    currentTurnId: firstPlayer.id,
                    startedAt: new Date(),
                    events: {
                        create: {
                            type: "session_started",
                            payload: { hostId: userId, currentTurnId: firstPlayer.id },
                        },
                    },
                },
            }),
        ]);
        this.emitStateChange(sessionId);
        return this.getSessionState(sessionId);
    }
    async getSessionState(sessionId) {
        const session = await this.prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                players: {
                    include: { user: { select: { id: true, displayName: true } } },
                    orderBy: { joinOrder: "asc" },
                },
                events: { orderBy: { createdAt: "desc" }, take: 1 },
            },
        });
        if (!session) {
            throw new NotFoundException("Session not found");
        }
        return this.mapState(session);
    }
    async leaveSession(userId, sessionId) {
        const sessionPlayer = await this.prisma.sessionPlayer.findFirst({
            where: { sessionId, userId },
        });
        if (!sessionPlayer) {
            throw new NotFoundException("Player is not part of the session");
        }
        await this.prisma.sessionPlayer.update({
            where: { id: sessionPlayer.id },
            data: {
                eliminatedAt: new Date(),
                connected: false,
            },
        });
        await this.prisma.session.update({
            where: { id: sessionId },
            data: {
                events: {
                    create: {
                        type: "player_left",
                        payload: { userId },
                    },
                },
            },
        });
        this.emitStateChange(sessionId);
        return this.getSessionState(sessionId);
    }
    async attackTurn(userId, sessionId, dto) {
        void userId;
        void sessionId;
        void dto;
        throw new NotImplementedException("Turn-based combat is coming soon.");
    }
    async defendTurn(userId, sessionId, dto) {
        void userId;
        void sessionId;
        void dto;
        throw new NotImplementedException("Turn-based combat is coming soon.");
    }
    emitStateChange(sessionId) {
        this.events.emit("session.state.changed", { sessionId });
    }
    mapState(session) {
        const lastEvent = session.events?.[0] ?? null;
        const { players, ...rest } = session;
        const sessionData = rest;
        return {
            session: sessionData,
            players,
            lastEvent,
        };
    }
    shuffle(input) {
        const array = [...input];
        for (let i = array.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
};
SessionsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService,
        UsersService,
        EventEmitter2])
], SessionsService);
export { SessionsService };
//# sourceMappingURL=sessions.service.js.map