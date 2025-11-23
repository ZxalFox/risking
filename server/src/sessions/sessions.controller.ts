import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard.js";
import { JwtPayload } from "../auth/strategies/jwt.strategy.js";
import { AttackTurnDto } from "./dto/attack-turn.dto.js";
import { CreateSessionDto } from "./dto/create-session.dto.js";
import { DefendTurnDto } from "./dto/defend-turn.dto.js";
import { JoinSessionDto } from "./dto/join-session.dto.js";
import { SessionsService } from "./sessions.service.js";

@Controller("sessions")
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSessionDto) {
    return this.sessionsService.createSession(user.sub, dto);
  }

  @Get("active")
  listActive() {
    return this.sessionsService.listActiveSessions();
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/join")
  join(
    @CurrentUser() user: JwtPayload,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: JoinSessionDto
  ) {
    return this.sessionsService.joinSession(user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/start")
  start(
    @CurrentUser() user: JwtPayload,
    @Param("id", new ParseUUIDPipe()) id: string
  ) {
    return this.sessionsService.startSession(user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/leave")
  leave(
    @CurrentUser() user: JwtPayload,
    @Param("id", new ParseUUIDPipe()) id: string
  ) {
    return this.sessionsService.leaveSession(user.sub, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id/state")
  state(@Param("id", new ParseUUIDPipe()) id: string) {
    return this.sessionsService.getSessionState(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/attack")
  attack(
    @CurrentUser() user: JwtPayload,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: AttackTurnDto
  ) {
    return this.sessionsService.attackTurn(user.sub, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/defend")
  defend(
    @CurrentUser() user: JwtPayload,
    @Param("id", new ParseUUIDPipe()) id: string,
    @Body() dto: DefendTurnDto
  ) {
    return this.sessionsService.defendTurn(user.sub, id, dto);
  }
}
