import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { RoomEntity } from '../database/entities/room.entity';
import { PlayerEntity } from '../database/entities/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoomEntity, PlayerEntity])],
  providers: [GameGateway, GameService],
})
export class GameModule {}
