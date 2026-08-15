import { Test, TestingModule } from "@nestjs/testing";
import { GameGateway } from "./game.gateway";
import { GameService } from "./game.service";
import { Server, Socket } from "socket.io";

describe("GameGateway - WebSocket E2E & Integration", () => {
  let gateway: GameGateway;
  let service: jest.Mocked<GameService>;
  let emittedRoomEvents: Map<string, any[]>;
  let emittedClientEvents: Map<string, any[]>;

  const createMockSocket = (id = "socket-test-1"): Partial<Socket> => ({
    id,
    join: jest.fn(),
    leave: jest.fn(),
    emit: jest.fn((event: string, data: any) => {
      const list = emittedClientEvents.get(event) || [];
      list.push(data);
      emittedClientEvents.set(event, list);
      return true;
    }) as any,
  });

  const createMockServer = (): Partial<Server> => ({
    to: jest.fn((roomId: string) => ({
      emit: jest.fn((event: string, data: any) => {
        const list = emittedRoomEvents.get(`${roomId}:${event}`) || [];
        list.push(data);
        emittedRoomEvents.set(`${roomId}:${event}`, list);
        return true;
      }),
    })) as any,
  });

  beforeEach(async () => {
    emittedRoomEvents = new Map<string, any[]>();
    emittedClientEvents = new Map<string, any[]>();

    const mockGameService = {
      createRoom: jest.fn(),
      getRoom: jest.fn(),
      joinRoom: jest.fn(),
      leaveRoom: jest.fn(),
      endGame: jest.fn(),
      startGame: jest.fn(),
      attack: jest.fn(),
      defend: jest.fn(),
      proposeMitigation: jest.fn(),
      evaluateMitigation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameGateway,
        { provide: GameService, useValue: mockGameService },
      ],
    }).compile();

    gateway = module.get<GameGateway>(GameGateway);
    service = module.get(GameService);
    gateway.server = createMockServer() as Server;
  });

  it("deve gerenciar o ciclo de criação e entrada na sala via WebSocket", async () => {
    const mockSocket = createMockSocket("socket-test-1");
    const mockRoom = { id: "ROOM1", status: "waiting", players: [] } as any;
    const mockPlayer = { id: "socket-test-1", nickname: "Player 1" } as any;

    service.createRoom.mockResolvedValue("ROOM1");
    service.joinRoom.mockResolvedValue({
      room: mockRoom,
      player: mockPlayer,
    });

    await gateway.handleCreateRoom(mockSocket as Socket, {
      nickname: "Player 1",
    });

    expect(mockSocket.join).toHaveBeenCalledWith("ROOM1");
    expect(emittedClientEvents.get("roomCreated")).toEqual([
      {
        event: "roomCreated",
        data: mockRoom,
        playerId: "socket-test-1",
      },
    ]);
  });

  it("deve propagar eventos de ataque, proposta de mitigação e avaliação para a sala", async () => {
    const mockSocket = createMockSocket("socket-test-1");
    const mockRoom = {
      id: "ROOM1",
      status: "playing",
      currentAttack: {
        attackerId: "socket-test-1",
        targetId: "socket-test-2",
        riskCard: { id: "r1", categoryId: "task", descriptionId: "risk_1" },
        proposedMitigation: "Inspeção contínua",
      },
    } as any;

    // Ataque
    service.attack.mockResolvedValue(mockRoom);
    await gateway.handleAttack(mockSocket as Socket, {
      roomId: "ROOM1",
      targetId: "socket-test-2",
      riskCardId: "r1",
    });
    expect(service.attack).toHaveBeenCalledWith(
      "ROOM1",
      "socket-test-1",
      "socket-test-2",
      "r1",
    );
    expect(emittedRoomEvents.get("ROOM1:attacked")).toEqual([mockRoom]);

    // Proposta de mitigação
    service.proposeMitigation.mockResolvedValue(mockRoom);
    await gateway.handleProposeMitigation(mockSocket as Socket, {
      roomId: "ROOM1",
      description: "Inspeção contínua",
    });
    expect(emittedRoomEvents.get("ROOM1:mitigationProposed")).toEqual([
      mockRoom,
    ]);

    // Avaliação da mitigação
    const mockResolvedRoom = {
      ...mockRoom,
      currentAttack: null,
      currentPlayerIndex: 1,
    } as any;
    service.evaluateMitigation.mockResolvedValue(mockResolvedRoom);
    await gateway.handleEvaluateMitigation(mockSocket as Socket, {
      roomId: "ROOM1",
      approved: true,
    });
    expect(emittedRoomEvents.get("ROOM1:defenseResult")).toEqual([
      mockResolvedRoom,
    ]);
  });

  it("deve emitir evento de erro para o cliente quando uma ação falhar", async () => {
    const mockSocket = createMockSocket("socket-test-1");
    service.attack.mockRejectedValue(
      new Error("Não é o seu turno para atacar"),
    );

    await gateway.handleAttack(mockSocket as Socket, {
      roomId: "ROOM1",
      targetId: "socket-test-2",
      riskCardId: "r1",
    });

    expect(emittedClientEvents.get("error")).toEqual([
      { data: "Não é o seu turno para atacar" },
    ]);
  });
});
