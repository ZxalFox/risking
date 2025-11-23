import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { AuthModule } from "./auth/auth.module.js";
import { PrismaModule } from "./prisma/prisma.module.js";
import { SessionsModule } from "./sessions/sessions.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    UsersModule,
    AuthModule,
    SessionsModule,
  ],
})
export class AppModule {}
