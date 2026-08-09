import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { RoomEntity } from "./room.entity";
import { RiskCard, MitigationCard } from "../../game/game.types";

@Entity("players")
export class PlayerEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  nickname: string;

  @Column({ default: false })
  isCreator: boolean;

  @Column({ default: 0 })
  money: number;

  @Column({ type: "jsonb", default: [] })
  riskCards: RiskCard[];

  @Column({ type: "jsonb", default: [] })
  mitigationCards: MitigationCard[];

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => RoomEntity, (room) => room.players, { onDelete: "CASCADE" })
  room: RoomEntity;
}
