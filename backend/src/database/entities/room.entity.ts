import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { PlayerEntity } from './player.entity';

@Entity('rooms')
export class RoomEntity {
  @PrimaryColumn()
  id: string;

  @Column({ default: 'waiting' })
  status: string; // 'waiting', 'playing', 'finished'

  @Column({ default: 0 })
  currentRound: number;

  @Column({ default: 0 })
  currentPlayerIndex: number;

  @Column({ type: 'jsonb', nullable: true })
  currentAttack: any;

  @OneToMany(() => PlayerEntity, player => player.room, { cascade: true, eager: true })
  players: PlayerEntity[];
}
