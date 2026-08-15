import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { GameService } from "./game.service";
import { RoomEntity } from "../database/entities/room.entity";
import { PlayerEntity } from "../database/entities/player.entity";
import { RiskCard, MitigationCard } from "./game.types";

describe("GameService - Automated Game Flow & Room Management", () => {
  let service: GameService;
  let roomsDb: Map<string, RoomEntity>;
  let playersDb: Map<string, PlayerEntity>;

  beforeEach(async () => {
    roomsDb = new Map<string, RoomEntity>();
    playersDb = new Map<string, PlayerEntity>();

    const mockRoomRepo = {
      create: jest.fn((dto: Partial<RoomEntity>) => {
        return {
          id: dto.id || "",
          status: dto.status || "waiting",
          currentRound: dto.currentRound || 0,
          currentPlayerIndex: dto.currentPlayerIndex || 0,
          players: [],
          currentAttack: null,
        } as RoomEntity;
      }),
      save: jest.fn(async (room: RoomEntity) => {
        const existing = roomsDb.get(room.id) || ({} as RoomEntity);
        const saved = { ...existing, ...room };
        roomsDb.set(room.id, saved);
        return saved;
      }),
      findOne: jest.fn(async (opts: any) => {
        const roomId = opts?.where?.id;
        const room = roomsDb.get(roomId);
        if (!room) return null;
        const roomPlayers = Array.from(playersDb.values()).filter(
          (p) => p.room?.id === roomId,
        );
        return {
          ...room,
          players: roomPlayers.map((p) => ({ ...p })),
        } as RoomEntity;
      }),
      delete: jest.fn(async (roomId: string) => {
        roomsDb.delete(roomId);
        return { affected: 1 };
      }),
    };

    const mockPlayerRepo = {
      create: jest.fn((dto: Partial<PlayerEntity>) => {
        return {
          id: dto.id || "",
          nickname: dto.nickname || "",
          isCreator: dto.isCreator || false,
          money: dto.money || 0,
          riskCards: dto.riskCards || [],
          mitigationCards: dto.mitigationCards || [],
          room: dto.room,
          createdAt: new Date(),
        } as PlayerEntity;
      }),
      save: jest.fn(async (entityOrEntities: any) => {
        const list = Array.isArray(entityOrEntities)
          ? entityOrEntities
          : [entityOrEntities];
        for (const p of list) {
          const existing = playersDb.get(p.id) || {};
          playersDb.set(p.id, { ...existing, ...p });
        }
        return entityOrEntities;
      }),
      findOne: jest.fn(async (opts: any) => {
        if (opts?.where?.room?.id && opts?.where?.nickname) {
          const found = Array.from(playersDb.values()).find(
            (p) =>
              p.room?.id === opts.where.room.id &&
              p.nickname === opts.where.nickname,
          );
          return found ? { ...found } : null;
        }
        if (opts?.where?.id && opts?.where?.room?.id) {
          const found = Array.from(playersDb.values()).find(
            (p) => p.id === opts.where.id && p.room?.id === opts.where.room.id,
          );
          return found ? { ...found } : null;
        }
        if (opts?.where?.id) {
          const found = playersDb.get(opts.where.id);
          return found ? { ...found } : null;
        }
        return null;
      }),
      delete: jest.fn(async (criteria: any) => {
        const id = typeof criteria === "string" ? criteria : criteria.id;
        playersDb.delete(id);
        return { affected: 1 };
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: getRepositoryToken(RoomEntity), useValue: mockRoomRepo },
        { provide: getRepositoryToken(PlayerEntity), useValue: mockPlayerRepo },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  describe("Suíte 1: Fluxo Básico de Partida (Happy Path)", () => {
    it("deve executar o fluxo completo de uma rodada com criação, entrada, ataque com carta e defesa com descrição textual aceita", async () => {
      // 1. Player 1 cria uma sala
      const roomId = await service.createRoom();
      expect(roomId).toBeDefined();
      expect(typeof roomId).toBe("string");
      expect(roomId.length).toBeGreaterThan(0);

      const p1Join = await service.joinRoom(roomId, {
        id: "socket-player-1",
        nickname: "Player 1",
        isCreator: true,
      });

      expect(p1Join.player.isCreator).toBe(true);
      expect(p1Join.player.nickname).toBe("Player 1");
      expect(p1Join.room.status).toBe("waiting");
      expect(p1Join.room.players).toHaveLength(1);

      // 2. Player 2 entra na sala do Player 1
      const p2Join = await service.joinRoom(roomId, {
        id: "socket-player-2",
        nickname: "Player 2",
        isCreator: false,
      });

      expect(p2Join.player.isCreator).toBe(false);
      expect(p2Join.player.nickname).toBe("Player 2");
      expect(p2Join.room.players).toHaveLength(2);
      expect(p2Join.room.status).toBe("waiting");

      // 3. Player 1 inicia a partida
      const startedRoom = await service.startGame(roomId);
      expect(startedRoom.status).toBe("playing");
      expect(startedRoom.currentRound).toBe(1);
      expect(startedRoom.currentPlayerIndex).toBe(0); // Turno do Player 1

      const p1 = startedRoom.players.find((p) => p.id === "socket-player-1")!;
      const p2 = startedRoom.players.find((p) => p.id === "socket-player-2")!;

      expect(p1.money).toBe(30);
      expect(p2.money).toBe(30);
      expect(p1.riskCards).toHaveLength(3);
      expect(p1.mitigationCards).toHaveLength(2);
      expect(p2.riskCards).toHaveLength(3);
      expect(p2.mitigationCards).toHaveLength(2);

      // 4. Player 1 ataca o Player 2 com uma carta de Risco
      const p1RiskCardToPlay: RiskCard = {
        id: "risk-custom-1",
        categoryId: "task",
        descriptionId: "risk_1",
      };
      p1.riskCards[0] = p1RiskCardToPlay;
      await service["playerRepo"].save(p1);

      // Garantir carta de mitigação correspondente na mão de Player 2 para o teste
      const p2MatchingMitigation: MitigationCard = {
        id: "mit-custom-1",
        categoryId: "task",
      };
      p2.mitigationCards[0] = p2MatchingMitigation;
      await service["playerRepo"].save(p2);

      const attackedRoom = await service.attack(
        roomId,
        "socket-player-1",
        "socket-player-2",
        p1RiskCardToPlay.id,
      );

      expect(attackedRoom.currentAttack).toBeDefined();
      expect(attackedRoom.currentAttack?.attackerId).toBe("socket-player-1");
      expect(attackedRoom.currentAttack?.targetId).toBe("socket-player-2");
      expect(attackedRoom.currentAttack?.riskCard.id).toBe(p1RiskCardToPlay.id);

      // 5. Player 2 se defende jogando a carta de mitigação válida
      const defendedRoom = await service.defend(
        roomId,
        "socket-player-2",
        true,
        p2MatchingMitigation.id,
      );

      expect(defendedRoom.currentAttack).toBeNull();
      // Player 2 defendeu com sucesso: Atacante paga 5 para Defensor
      const p1AfterDefend = defendedRoom.players.find(
        (p) => p.id === "socket-player-1",
      )!;
      const p2AfterDefend = defendedRoom.players.find(
        (p) => p.id === "socket-player-2",
      )!;
      expect(p1AfterDefend.money).toBe(25);
      expect(p2AfterDefend.money).toBe(35);
      // Turno passou para Player 2
      expect(defendedRoom.currentPlayerIndex).toBe(1);

      // 6. Player 2 (no seu turno) ataca o Player 1
      const p2RiskCardToPlay: RiskCard = {
        id: "risk-custom-2",
        categoryId: "technology",
        descriptionId: "risk_10",
      };
      p2AfterDefend.riskCards[0] = p2RiskCardToPlay;
      await service["playerRepo"].save(p2AfterDefend);

      const p2AttackRoom = await service.attack(
        roomId,
        "socket-player-2",
        "socket-player-1",
        p2RiskCardToPlay.id,
      );

      expect(p2AttackRoom.currentAttack).toBeDefined();
      expect(p2AttackRoom.currentAttack?.attackerId).toBe("socket-player-2");
      expect(p2AttackRoom.currentAttack?.targetId).toBe("socket-player-1");

      // 7. Player 1 se defende utilizando "Descrever mitigação"
      const mitigationDescription =
        "Realizar inspeções e análise de compatibilidade antes da integração de componentes externos.";
      const proposedRoom = await service.proposeMitigation(
        roomId,
        "socket-player-1",
        mitigationDescription,
      );

      expect(proposedRoom.currentAttack?.proposedMitigation).toBe(
        mitigationDescription,
      );

      // 8. Player 2 avalia e aceita a descrição da mitigação
      const resolvedRoom = await service.evaluateMitigation(
        roomId,
        "socket-player-2",
        true,
      );

      expect(resolvedRoom.currentAttack).toBeNull();
      const p1Final = resolvedRoom.players.find(
        (p) => p.id === "socket-player-1",
      )!;
      const p2Final = resolvedRoom.players.find(
        (p) => p.id === "socket-player-2",
      )!;

      // Defesa bem-sucedida: Atacante (Player 2) perde 5, Defensor (Player 1) ganha 5
      expect(p1Final.money).toBe(30); // 25 + 5
      expect(p2Final.money).toBe(30); // 35 - 5

      // Turno voltou ao Player 1 e avançou para a rodada 2
      expect(resolvedRoom.currentPlayerIndex).toBe(0);
      expect(resolvedRoom.currentRound).toBe(2);
    });
  });

  describe("Suíte 2: Variações da Dinâmica de Defesa", () => {
    let roomId: string;

    beforeEach(async () => {
      roomId = await service.createRoom();
      await service.joinRoom(roomId, {
        id: "p1",
        nickname: "Player 1",
        isCreator: true,
      });
      await service.joinRoom(roomId, {
        id: "p2",
        nickname: "Player 2",
        isCreator: false,
      });
      await service.startGame(roomId);
    });

    it("Cenário A (Mitigação Negada): o atacante nega a mitigação descrita pelo defensor e a penalidade é aplicada ao defensor", async () => {
      const room = (await service.getRoom(roomId))!;
      const p1 = room.players.find((p) => p.id === "p1")!;
      const riskCardId = p1.riskCards[0].id;

      // Player 1 ataca Player 2
      await service.attack(roomId, "p1", "p2", riskCardId);

      // Player 2 propõe uma mitigação incorreta
      await service.proposeMitigation(
        roomId,
        "p2",
        "Mitigação incorreta e não condizente com o risco.",
      );

      // Player 1 nega a mitigação
      const updatedRoom = await service.evaluateMitigation(roomId, "p1", false);

      expect(updatedRoom.currentAttack).toBeNull();
      const p1After = updatedRoom.players.find((p) => p.id === "p1")!;
      const p2After = updatedRoom.players.find((p) => p.id === "p2")!;

      // Ataque bem-sucedido: Defensor perde 5, Atacante ganha 5
      expect(p1After.money).toBe(35);
      expect(p2After.money).toBe(25);
      // Turno avançou
      expect(updatedRoom.currentPlayerIndex).toBe(1);
    });

    it("Cenário B (Aceitar o Ataque sem Defesa): o defensor aceita a penalidade e a consequência é aplicada diretamente", async () => {
      const room = (await service.getRoom(roomId))!;
      const p1 = room.players.find((p) => p.id === "p1")!;
      const riskCardId = p1.riskCards[0].id;

      // Player 1 ataca Player 2
      await service.attack(roomId, "p1", "p2", riskCardId);

      // Player 2 aceita a penalidade sem jogar carta nem descrever mitigação
      const updatedRoom = await service.defend(roomId, "p2", false);

      expect(updatedRoom.currentAttack).toBeNull();
      const p1After = updatedRoom.players.find((p) => p.id === "p1")!;
      const p2After = updatedRoom.players.find((p) => p.id === "p2")!;

      expect(p1After.money).toBe(35);
      expect(p2After.money).toBe(25);
      expect(updatedRoom.currentPlayerIndex).toBe(1);
    });
  });

  describe("Suíte 3: Gerenciamento da Sala e Sessão", () => {
    it("Cenário C1: Player 2 sai da sala de espera e é removido da lista de jogadores", async () => {
      const roomId = await service.createRoom();
      await service.joinRoom(roomId, {
        id: "p1",
        nickname: "Host",
        isCreator: true,
      });
      await service.joinRoom(roomId, {
        id: "p2",
        nickname: "Player 2",
        isCreator: false,
      });

      await service.leaveRoom(roomId, "p2");
      const room = await service.getRoom(roomId);

      expect(room?.players).toHaveLength(1);
      expect(room?.players[0].id).toBe("p1");
    });

    it("Cenário C2: Player 2 sai durante uma partida com 2 jogadores, encerrando a partida como finished", async () => {
      const roomId = await service.createRoom();
      await service.joinRoom(roomId, {
        id: "p1",
        nickname: "Host",
        isCreator: true,
      });
      await service.joinRoom(roomId, {
        id: "p2",
        nickname: "Player 2",
        isCreator: false,
      });
      await service.startGame(roomId);

      await service.leaveRoom(roomId, "p2");
      const room = await service.getRoom(roomId);

      expect(room?.status).toBe("finished");
      expect(room?.players).toHaveLength(1);
    });

    it("Cenário C3: Host não pode sair da sala diretamente, deve finalizá-la", async () => {
      const roomId = await service.createRoom();
      await service.joinRoom(roomId, {
        id: "p1",
        nickname: "Host",
        isCreator: true,
      });

      await expect(service.leaveRoom(roomId, "p1")).rejects.toThrow(
        "O Host não pode sair da partida, apenas finalizá-la",
      );
    });

    it("Cenário D: Host finaliza a partida deliberadamente e não-host é impedido", async () => {
      const roomId = await service.createRoom();
      await service.joinRoom(roomId, {
        id: "p1",
        nickname: "Host",
        isCreator: true,
      });
      await service.joinRoom(roomId, {
        id: "p2",
        nickname: "Player 2",
        isCreator: false,
      });
      await service.startGame(roomId);

      // Não-host tenta finalizar
      await expect(service.endGame(roomId, "p2")).rejects.toThrow(
        "Apenas o Host pode finalizar a partida",
      );

      // Host finaliza
      const endedRoom = await service.endGame(roomId, "p1");
      expect(endedRoom.status).toBe("finished");
    });
  });
});
