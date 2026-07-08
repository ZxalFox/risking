import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './entities/room.entity';
import { PlayerEntity } from './entities/player.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'risking',
      password: process.env.DB_PASSWORD || 'risking_password',
      database: process.env.DB_NAME || 'risking_db',
      entities: [RoomEntity, PlayerEntity],
      synchronize: true, // Auto-create tables for dev. Use migrations in prod.
    }),
  ],
})
export class DatabaseModule {}
