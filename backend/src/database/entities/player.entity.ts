import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { RoomEntity } from './room.entity';

@Entity('players')
export class PlayerEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  nickname: string;

  @Column({ default: false })
  isCreator: boolean;

  @Column({ default: 0 })
  money: number;

  @Column({ type: 'jsonb', default: [] })
  riskCards: any[];

  @Column({ type: 'jsonb', default: [] })
  mitigationCards: any[];

  @ManyToOne(() => RoomEntity, room => room.players, { onDelete: 'CASCADE' })
  room: RoomEntity;
}
