"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

interface GameContextProps {
  socketId?: string;
  isConnected: boolean;
  room: any;
  error: string | null;
  createRoom: (nickname: string) => void;
  joinRoom: (roomId: string, nickname: string) => void;
  startGame: (roomId: string) => void;
  attack: (roomId: string, targetId: string, riskCardId: string) => void;
  defend: (roomId: string, success: boolean, mitigationCardId?: string) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) {
      socket = io("http://localhost:3001");
    }

    setIsConnected(socket.connected);

    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);
    });

    socket.on("connect_error", (err) => {
      setIsConnected(false);
      setError("Erro de Conexão: " + err.message);
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("roomCreated", (data) => {
      if (data.event === "error") setError(data.data);
      else setRoom(data.data);
    });

    socket.on("roomJoined", (data) => {
      if (data.event === "error") setError(data.data);
      else setRoom(data.data);
    });

    socket.on("roomUpdated", (data) => setRoom(data));
    socket.on("gameStarted", (data) => setRoom(data));
    socket.on("attacked", (data) => setRoom(data));
    socket.on("defenseResult", (data) => setRoom(data));
    socket.on("error", (err) => setError(err.data || err));

    return () => {
      socket?.off("connect");
      socket?.off("connect_error");
      socket?.off("disconnect");
      socket?.off("roomCreated");
      socket?.off("roomJoined");
      socket?.off("roomUpdated");
      socket?.off("gameStarted");
      socket?.off("attacked");
      socket?.off("defenseResult");
      socket?.off("error");
    };
  }, []);

  const createRoom = useCallback((nickname: string) => {
    setError(null);
    socket?.emit("createRoom", { nickname });
  }, []);

  const joinRoom = useCallback((roomId: string, nickname: string) => {
    setError(null);
    socket?.emit("joinRoom", { roomId, nickname });
  }, []);

  const startGame = useCallback((roomId: string) => {
    setError(null);
    socket?.emit("startGame", { roomId });
  }, []);

  const attack = useCallback((roomId: string, targetId: string, riskCardId: string) => {
    socket?.emit("attack", { roomId, targetId, riskCardId });
  }, []);

  const defend = useCallback((roomId: string, success: boolean, mitigationCardId?: string) => {
    socket?.emit("defend", { roomId, success, mitigationCardId });
  }, []);

  return (
    <GameContext.Provider
      value={{
        socketId: socket?.id,
        isConnected,
        room,
        error,
        createRoom,
        joinRoom,
        startGame,
        attack,
        defend,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
