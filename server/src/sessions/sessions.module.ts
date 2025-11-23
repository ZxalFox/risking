import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { UsersModule } from "../users/users.module.js";
import { SessionsController } from "./sessions.controller.js";
import { SessionsGateway } from "./sessions.gateway.js";
import { SessionsService } from "./sessions.service.js";

@Module({
  imports: [UsersModule, AuthModule],
  controllers: [SessionsController],
  providers: [SessionsService, SessionsGateway],
  exports: [SessionsService],
})
export class SessionsModule {}
