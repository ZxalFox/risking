import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from '../database/entities/room.entity';
import { PlayerEntity } from '../database/entities/player.entity';
import { Player, Room, RiskCard, MitigationCard, Mitigation } from './game.types';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepo: Repository<RoomEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playerRepo: Repository<PlayerEntity>,
  ) {}

  // Mock data for MVP
  private readonly MOCK_RISK_CARDS: RiskCard[] = [
    { id: 'r1', categoryId: 'task', descriptionId: 'risk_1' },
    { id: 'r2', categoryId: 'task', descriptionId: 'risk_2' },
    { id: 'r3', categoryId: 'task', descriptionId: 'risk_3' },
    { id: 'r4', categoryId: 'structure', descriptionId: 'risk_4' },
    { id: 'r5', categoryId: 'structure', descriptionId: 'risk_5' },
    { id: 'r6', categoryId: 'structure', descriptionId: 'risk_6' },
    { id: 'r7', categoryId: 'actor', descriptionId: 'risk_7' },
    { id: 'r8', categoryId: 'actor', descriptionId: 'risk_8' },
    { id: 'r9', categoryId: 'actor', descriptionId: 'risk_9' },
    { id: 'r10', categoryId: 'technology', descriptionId: 'risk_10' },
    { id: 'r11', categoryId: 'technology', descriptionId: 'risk_11' },
    { id: 'r12', categoryId: 'technology', descriptionId: 'risk_12' },
    { id: 'r13', categoryId: 'task_actor', descriptionId: 'risk_13' },
    { id: 'r14', categoryId: 'task_actor', descriptionId: 'risk_14' },
    { id: 'r15', categoryId: 'task_actor', descriptionId: 'risk_15' },
    { id: 'r16', categoryId: 'task_technology', descriptionId: 'risk_16' },
    { id: 'r17', categoryId: 'task_technology', descriptionId: 'risk_17' },
    { id: 'r18', categoryId: 'task_technology', descriptionId: 'risk_18' },
    { id: 'r19', categoryId: 'structure_task', descriptionId: 'risk_19' },
    { id: 'r20', categoryId: 'structure_task', descriptionId: 'risk_20' },
    { id: 'r21', categoryId: 'actor_technology', descriptionId: 'risk_21' },
    { id: 'r22', categoryId: 'actor_technology', descriptionId: 'risk_22' },
    { id: 'r23', categoryId: 'actor_structure', descriptionId: 'risk_23' },
    { id: 'r24', categoryId: 'actor_structure', descriptionId: 'risk_24' },
    { id: 'r25', categoryId: 'structure_technology', descriptionId: 'risk_25' },
    { id: 'r26', categoryId: 'structure_technology', descriptionId: 'risk_26' }
  ];

  private readonly MOCK_MITIGATION_CARDS: MitigationCard[] = [
    { id: 'm1', categoryId: 'task' },
    { id: 'm2', categoryId: 'structure' },
    { id: 'm3', categoryId: 'actor' },
    { id: 'm4', categoryId: 'technology' },
    { id: 'm5', categoryId: 'task_actor' },
    { id: 'm6', categoryId: 'task_technology' },
    { id: 'm7', categoryId: 'structure_task' },
    { id: 'm8', categoryId: 'actor_technology' },
    { id: 'm9', categoryId: 'actor_structure' },
    { id: 'm10', categoryId: 'structure_technology' },
    { id: 'm11', categoryId: 'task' },
    { id: 'm12', categoryId: 'structure' },
    { id: 'm13', categoryId: 'actor' },
    { id: 'm14', categoryId: 'technology' },
    { id: 'm15', categoryId: 'task_actor' },
    { id: 'm16', categoryId: 'task_technology' },
    { id: 'm17', categoryId: 'structure_task' }
  ];

  async createRoom(): Promise<string> {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = this.roomRepo.create({
      id: roomId,
      status: 'waiting',
      currentRound: 0,
      currentPlayerIndex: 0
    });
    await this.roomRepo.save(room);
    return roomId;
  }

  async getRoom(roomId: string): Promise<RoomEntity | null> {
    return this.roomRepo.findOne({ where: { id: roomId } });
  }

  async joinRoom(roomId: string, player: Omit<Player, 'money' | 'riskCards' | 'mitigationCards'>): Promise<{ room: RoomEntity, player: PlayerEntity }> {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new Error('Sala não encontrada');
    let existing = await this.playerRepo.findOne({ where: { room: { id: roomId }, nickname: player.nickname } });
    
    if (room.status !== 'waiting' && !existing) {
      throw new Error('Jogo já começou');
    }
    
    let dbPlayer;
    if (existing) {
      dbPlayer = existing;
    } else {
      if (room.players.length >= 5) throw new Error('Sala cheia');
      dbPlayer = this.playerRepo.create({
        id: player.id,
        nickname: player.nickname,
        money: 0,
        riskCards: [],
        mitigationCards: [],
        isCreator: player.isCreator,
        room
      });
      await this.playerRepo.save(dbPlayer);
    }

    const updatedRoom = (await this.roomRepo.findOne({ where: { id: roomId } })) as RoomEntity;
    return { room: updatedRoom, player: dbPlayer };
  }

  async leaveRoom(roomId: string, playerId: string): Promise<void> {
    const player = await this.playerRepo.findOne({ where: { id: playerId, room: { id: roomId } } });
    if (!player) return;

    if (player.isCreator) {
      throw new Error('O Host não pode sair da partida, apenas finalizá-la');
    }

    await this.playerRepo.delete({ id: playerId });
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    
    if (room) {
      if (room.players.length === 0) {
        await this.roomRepo.delete(roomId);
      } else if (room.status === 'playing' && room.players.length === 1) {
        room.status = 'finished';
        await this.roomRepo.save(room);
      }
    }
  }

  async endGame(roomId: string, hostId: string): Promise<RoomEntity> {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new Error('Sala não encontrada');
    
    const host = room.players.find(p => p.id === hostId);
    if (!host || !host.isCreator) {
      throw new Error('Apenas o Host pode finalizar a partida');
    }

    room.status = 'finished';
    await this.roomRepo.save(room);
    return (await this.roomRepo.findOne({ where: { id: roomId } })) as RoomEntity;
  }

  async startGame(roomId: string): Promise<RoomEntity> {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new Error('Sala não encontrada');
    if (room.players.length < 2) throw new Error('Mínimo 2 jogadores');

    room.status = 'playing';
    room.currentRound = 1;
    room.currentPlayerIndex = 0;

    for (const p of room.players) {
      p.money = 30;
      p.riskCards = this.getRandomCards(this.MOCK_RISK_CARDS, 3);
      p.mitigationCards = this.getRandomCards(this.MOCK_MITIGATION_CARDS, 2);
      await this.playerRepo.save(p);
    }

    await this.roomRepo.save(room);
    return (await this.roomRepo.findOne({ where: { id: roomId } })) as RoomEntity;
  }

  async attack(roomId: string, attackerId: string, targetId: string, riskCardId: string): Promise<RoomEntity> {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new Error('Sala não encontrada');
    if (room.status !== 'playing') throw new Error('Jogo não está em andamento');

    const attacker = room.players.find(p => p.id === attackerId);
    const riskCardIndex = attacker?.riskCards.findIndex((c: any) => c.id === riskCardId);
    
    if (!attacker || riskCardIndex === undefined || riskCardIndex === -1) {
       throw new Error('Carta ou atacante inválido');
    }

    const riskCard = attacker.riskCards.splice(riskCardIndex, 1)[0];
    await this.playerRepo.save(attacker);
    
    room.currentAttack = {
      attackerId,
      targetId,
      riskCard
    };

    await this.roomRepo.save(room);
    return (await this.roomRepo.findOne({ where: { id: roomId } })) as RoomEntity;
  }

  async defend(roomId: string, targetId: string, success: boolean, mitigationCardId?: string): Promise<RoomEntity> {
    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room || !room.currentAttack || room.currentAttack.targetId !== targetId) {
      throw new Error('Nenhum ataque contra este jogador');
    }

    const target = room.players.find(p => p.id === targetId);
    const attacker = room.players.find(p => p.id === room.currentAttack.attackerId);

    if (!target || !attacker) throw new Error('Jogadores inválidos');

    let actualSuccess = false;
    if (mitigationCardId) {
      const mcIndex = target.mitigationCards.findIndex((c: any) => c.id === mitigationCardId);
      if (mcIndex !== -1) {
        const mc = target.mitigationCards[mcIndex];
        if (mc.categoryId === room.currentAttack.riskCard.categoryId) {
          target.mitigationCards.splice(mcIndex, 1);
          actualSuccess = true;
        }
      }
    }

    if (actualSuccess) {
      attacker.money -= 5;
      target.money += 5;
    } else {
      target.money -= 5;
      attacker.money += 5;
    }

    room.currentAttack = null;
    room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;

    if (room.currentPlayerIndex === 0) {
      room.currentRound++;
      if (room.currentRound > 4) {
        room.status = 'finished';
      } else {
        for (const p of room.players) {
          p.riskCards.push(...this.getRandomCards(this.MOCK_RISK_CARDS, 1));
        }
      }
    }

    await this.playerRepo.save([target, attacker, ...room.players.filter(p => p.id !== target.id && p.id !== attacker.id)]);
    await this.roomRepo.save(room);
    return (await this.roomRepo.findOne({ where: { id: roomId } })) as RoomEntity;
  }

  private getRandomCards<T>(deck: T[], amount: number): T[] {
    const shuffled = [...deck].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, amount);
  }
}
