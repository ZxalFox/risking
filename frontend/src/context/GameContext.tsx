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
  leaveRoom: (roomId: string) => void;
  endGame: (roomId: string) => void;
  clearRoom: () => void;
  attack: (roomId: string, targetId: string, riskCardId: string) => void;
  defend: (roomId: string, success: boolean, mitigationCardId?: string) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) {
      const defaultUrl = typeof window !== "undefined" ? `http://${window.location.hostname}:3001` : "http://localhost:3001";
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || defaultUrl;
      socket = io(backendUrl);
    }

    setIsConnected(socket.connected);

    const session = localStorage.getItem('risking_session');
    
    const tryReconnect = () => {
      if (session && socket) {
        try {
          const { roomId, nickname } = JSON.parse(session);
          if (roomId && nickname) {
            socket.emit("joinRoom", { roomId, nickname });
          }
        } catch (e) {}
      }
    };

    if (socket.connected) {
      setIsConnected(true);
      tryReconnect();
    }

    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);
      tryReconnect();
    });

    socket.on("connect_error", (err) => {
      setIsConnected(false);
      setError("Erro de Conexão: " + err.message);
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("roomCreated", (data) => {
      if (data.event === "error") setError(data.data);
      else {
        setRoom(data.data);
        if (data.playerId) setPlayerId(data.playerId);
        const me = data.data.players.find((p: any) => p.id === (data.playerId || socket?.id));
        if (me) localStorage.setItem('risking_session', JSON.stringify({ roomId: data.data.id, nickname: me.nickname }));
      }
    });

    socket.on("roomJoined", (data) => {
      if (data.event === "error") {
        setError(data.data);
        if (data.data === 'Sala não encontrada' || data.data === 'Jogo já começou') {
          localStorage.removeItem('risking_session');
        }
      } else {
        setRoom(data.data);
        if (data.playerId) setPlayerId(data.playerId);
        const me = data.data.players.find((p: any) => p.id === (data.playerId || socket?.id));
        if (me) localStorage.setItem('risking_session', JSON.stringify({ roomId: data.data.id, nickname: me.nickname }));
      }
    });

    const handleRoomData = (data: any) => {
      setRoom(data);
      if (data && data.status === 'finished') {
        localStorage.removeItem('risking_session');
      }
    };

    socket.on("roomUpdated", handleRoomData);
    socket.on("gameStarted", handleRoomData);
    socket.on("attacked", handleRoomData);
    socket.on("defenseResult", handleRoomData);
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

  const leaveRoom = useCallback((roomId: string) => {
    socket?.emit("leaveRoom", { roomId });
    setRoom(null);
    setPlayerId(null);
    localStorage.removeItem('risking_session');
  }, []);

  const endGame = useCallback((roomId: string) => {
    socket?.emit("endGame", { roomId });
  }, []);

  const clearRoom = useCallback(() => {
    setRoom(null);
    setPlayerId(null);
    localStorage.removeItem('risking_session');
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
        socketId: playerId || socket?.id,
        isConnected,
        room,
        error,
        createRoom,
        joinRoom,
        startGame,
        leaveRoom,
        endGame,
        clearRoom,
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
