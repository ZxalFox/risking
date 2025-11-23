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
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards, } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { AttackTurnDto } from "./dto/attack-turn.dto.js";
import { CreateSessionDto } from "./dto/create-session.dto.js";
import { DefendTurnDto } from "./dto/defend-turn.dto.js";
import { JoinSessionDto } from "./dto/join-session.dto.js";
import { SessionsService } from "./sessions.service.js";
let SessionsController = class SessionsController {
    sessionsService;
    constructor(sessionsService) {
        this.sessionsService = sessionsService;
    }
    create(user, dto) {
        return this.sessionsService.createSession(user.sub, dto);
    }
    listActive() {
        return this.sessionsService.listActiveSessions();
    }
    join(user, id, dto) {
        return this.sessionsService.joinSession(user.sub, id, dto);
    }
    start(user, id) {
        return this.sessionsService.startSession(user.sub, id);
    }
    leave(user, id) {
        return this.sessionsService.leaveSession(user.sub, id);
    }
    state(id) {
        return this.sessionsService.getSessionState(id);
    }
    attack(user, id, dto) {
        return this.sessionsService.attackTurn(user.sub, id, dto);
    }
    defend(user, id, dto) {
        return this.sessionsService.defendTurn(user.sub, id, dto);
    }
};
__decorate([
    UseGuards(JwtAuthGuard),
    Post(),
    __param(0, CurrentUser()),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, CreateSessionDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "create", null);
__decorate([
    Get("active"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "listActive", null);
__decorate([
    UseGuards(JwtAuthGuard),
    Post(":id/join"),
    __param(0, CurrentUser()),
    __param(1, Param("id", new ParseUUIDPipe())),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, JoinSessionDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "join", null);
__decorate([
    UseGuards(JwtAuthGuard),
    Post(":id/start"),
    __param(0, CurrentUser()),
    __param(1, Param("id", new ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "start", null);
__decorate([
    UseGuards(JwtAuthGuard),
    Post(":id/leave"),
    __param(0, CurrentUser()),
    __param(1, Param("id", new ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "leave", null);
__decorate([
    UseGuards(JwtAuthGuard),
    Get(":id/state"),
    __param(0, Param("id", new ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "state", null);
__decorate([
    UseGuards(JwtAuthGuard),
    Post(":id/attack"),
    __param(0, CurrentUser()),
    __param(1, Param("id", new ParseUUIDPipe())),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, AttackTurnDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "attack", null);
__decorate([
    UseGuards(JwtAuthGuard),
    Post(":id/defend"),
    __param(0, CurrentUser()),
    __param(1, Param("id", new ParseUUIDPipe())),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, DefendTurnDto]),
    __metadata("design:returntype", void 0)
], SessionsController.prototype, "defend", null);
SessionsController = __decorate([
    Controller("sessions"),
    __metadata("design:paramtypes", [SessionsService])
], SessionsController);
export { SessionsController };
//# sourceMappingURL=sessions.controller.js.map