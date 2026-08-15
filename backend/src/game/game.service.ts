import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { RoomEntity } from "../database/entities/room.entity";
import { PlayerEntity } from "../database/entities/player.entity";
import { Player, RiskCard } from "./game.types";
import { dealInitialPlayerHands } from "./helpers/game-deck.helper";
import {
  resolveMitigationCardMatch,
  applyDefenseFinancialConsequences,
  advanceRoomTurn,
} from "./helpers/game-rules.helper";

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(RoomEntity)
    private readonly roomRepo: Repository<RoomEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playerRepo: Repository<PlayerEntity>,
  ) {}

  async createRoom(): Promise<string> {
    // eslint-disable-next-line sonarjs/pseudo-random
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = this.roomRepo.create({
      id: roomId,
      status: "waiting",
      currentRound: 0,
      currentPlayerIndex: 0,
    });
    await this.roomRepo.save(room);
    return roomId;
  }

  async getRoom(roomId: string): Promise<RoomEntity | null> {
    return this.roomRepo.findOne({
      where: { id: roomId },
      order: { players: { createdAt: "ASC" } },
    });
  }

  async joinRoom(
    roomId: string,
    player: Omit<Player, "money" | "riskCards" | "mitigationCards">,
  ): Promise<{ room: RoomEntity; player: PlayerEntity }> {
    const room = await this.getRoom(roomId);
    if (!room) throw new Error("Sala não encontrada");
    const existing = await this.playerRepo.findOne({
      where: { room: { id: roomId }, nickname: player.nickname },
    });

    if (room.status !== "waiting" && !existing) {
      throw new Error("Jogo já começou");
    }

    let dbPlayer;
    if (existing) {
      dbPlayer = existing;
    } else {
      if (room.players.length >= 5) throw new Error("Sala cheia");
      dbPlayer = this.playerRepo.create({
        id: player.id,
        nickname: player.nickname,
        money: 0,
        riskCards: [],
        mitigationCards: [],
        isCreator: player.isCreator,
        room,
      });
      await this.playerRepo.save(dbPlayer);
    }

    const updatedRoom = (await this.getRoom(roomId)) as RoomEntity;
    return { room: updatedRoom, player: dbPlayer };
  }

  async leaveRoom(roomId: string, playerId: string): Promise<void> {
    const player = await this.playerRepo.findOne({
      where: { id: playerId, room: { id: roomId } },
    });
    if (!player) return;

    if (player.isCreator) {
      throw new Error("O Host não pode sair da partida, apenas finalizá-la");
    }

    await this.playerRepo.delete({ id: playerId });
    const room = await this.getRoom(roomId);

    if (room) {
      if (room.players.length === 0) {
        await this.roomRepo.delete(roomId);
      } else if (room.status === "playing" && room.players.length === 1) {
        room.status = "finished";
        await this.roomRepo.save(room);
      }
    }
  }

  async endGame(roomId: string, hostId: string): Promise<RoomEntity> {
    const room = await this.getRoom(roomId);
    if (!room) throw new Error("Sala não encontrada");

    const host = room.players.find((p) => p.id === hostId);
    if (!host || !host.isCreator) {
      throw new Error("Apenas o Host pode finalizar a partida");
    }

    room.status = "finished";
    await this.roomRepo.save(room);
    return (await this.getRoom(roomId)) as RoomEntity;
  }

  async startGame(roomId: string): Promise<RoomEntity> {
    const room = await this.getRoom(roomId);
    if (!room) throw new Error("Sala não encontrada");
    if (room.players.length < 2) throw new Error("Mínimo 2 jogadores");

    room.status = "playing";
    room.currentRound = 1;
    room.currentPlayerIndex = 0;

    dealInitialPlayerHands(room.players);
    for (const p of room.players) {
      await this.playerRepo.save(p);
    }

    await this.roomRepo.save(room);
    return (await this.getRoom(roomId)) as RoomEntity;
  }

  async attack(
    roomId: string,
    attackerId: string,
    targetId: string,
    riskCardId: string,
  ): Promise<RoomEntity> {
    const room = await this.getRoom(roomId);
    if (!room) throw new Error("Sala não encontrada");
    if (room.status !== "playing")
      throw new Error("Jogo não está em andamento");
    if (room.currentAttack) throw new Error("Já existe um ataque em andamento");

    const currentPlayer = room.players[room.currentPlayerIndex];
    if (!currentPlayer || currentPlayer.id !== attackerId) {
      throw new Error("Não é o seu turno para atacar");
    }

    if (attackerId === targetId) {
      throw new Error("Você não pode atacar a si mesmo");
    }

    const attacker = room.players.find((p) => p.id === attackerId);
    const riskCardIndex = attacker?.riskCards.findIndex(
      (c: RiskCard) => c.id === riskCardId,
    );

    if (!attacker || riskCardIndex === undefined || riskCardIndex === -1) {
      throw new Error("Carta ou atacante inválido");
    }

    const riskCard = attacker.riskCards.splice(riskCardIndex, 1)[0];
    await this.playerRepo.save(attacker);

    room.currentAttack = {
      attackerId,
      targetId,
      riskCard,
    };

    await this.roomRepo.save(room);
    return (await this.getRoom(roomId)) as RoomEntity;
  }

  async defend(
    roomId: string,
    targetId: string,
    success: boolean,
    mitigationCardId?: string,
  ): Promise<RoomEntity> {
    const room = await this.getRoom(roomId);
    if (
      !room ||
      !room.currentAttack ||
      room.currentAttack.targetId !== targetId
    ) {
      throw new Error("Nenhum ataque contra este jogador");
    }

    const target = room.players.find((p) => p.id === targetId);
    const attacker = room.players.find(
      (p) => p.id === room.currentAttack.attackerId,
    );

    if (!target || !attacker) throw new Error("Jogadores inválidos");

    const actualSuccess = resolveMitigationCardMatch(
      target,
      mitigationCardId,
      room.currentAttack.riskCard.categoryId,
    );

    applyDefenseFinancialConsequences(attacker, target, actualSuccess);
    advanceRoomTurn(room);

    await this.playerRepo.save([
      target,
      attacker,
      ...room.players.filter((p) => p.id !== target.id && p.id !== attacker.id),
    ]);
    await this.roomRepo.save(room);
    return (await this.getRoom(roomId)) as RoomEntity;
  }

  async proposeMitigation(
    roomId: string,
    targetId: string,
    description: string,
  ): Promise<RoomEntity> {
    const room = await this.getRoom(roomId);
    if (
      !room ||
      !room.currentAttack ||
      room.currentAttack.targetId !== targetId
    ) {
      throw new Error("Nenhum ataque contra este jogador");
    }
    if (room.status !== "playing") {
      throw new Error("Jogo não está em andamento");
    }

    const rawDesc = description ?? "";
    const trimmed = typeof rawDesc === "string" ? rawDesc.trim() : "";
    if (!trimmed) {
      throw new Error("A descrição da mitigação é obrigatória");
    }

    room.currentAttack.proposedMitigation = trimmed;
    await this.roomRepo.save(room);
    return (await this.getRoom(roomId)) as RoomEntity;
  }

  async evaluateMitigation(
    roomId: string,
    attackerId: string,
    approved: boolean,
  ): Promise<RoomEntity> {
    const room = await this.getRoom(roomId);
    if (
      !room ||
      !room.currentAttack ||
      room.currentAttack.attackerId !== attackerId
    ) {
      throw new Error("Apenas o atacante pode avaliar a defesa");
    }
    if (room.status !== "playing") {
      throw new Error("Jogo não está em andamento");
    }
    if (!room.currentAttack.proposedMitigation) {
      throw new Error("Nenhuma mitigação foi proposta para avaliação");
    }

    const currentAttack = room.currentAttack;
    const target = room.players.find((p) => p.id === currentAttack.targetId);
    const attacker = room.players.find((p) => p.id === attackerId);

    if (!target || !attacker) throw new Error("Jogadores inválidos");

    applyDefenseFinancialConsequences(attacker, target, approved);
    advanceRoomTurn(room);

    await this.playerRepo.save([
      target,
      attacker,
      ...room.players.filter((p) => p.id !== target.id && p.id !== attacker.id),
    ]);
    await this.roomRepo.save(room);
    return (await this.getRoom(roomId)) as RoomEntity;
  }
}
