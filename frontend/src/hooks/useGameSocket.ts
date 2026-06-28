import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useGameSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:3001'); // Ensure backend URL is correct
    }

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    socket.on('roomCreated', (data) => {
      if (data.event === 'error') setError(data.data);
      else setRoom(data.data);
    });

    socket.on('roomJoined', (data) => {
      if (data.event === 'error') setError(data.data);
      else setRoom(data.data);
    });

    socket.on('roomUpdated', (data) => setRoom(data));
    socket.on('gameStarted', (data) => setRoom(data));
    socket.on('attacked', (data) => setRoom(data));
    socket.on('defenseResult', (data) => setRoom(data));
    socket.on('error', (err) => setError(err.data || err));

    return () => {
      socket?.off('connect');
      socket?.off('disconnect');
      socket?.off('roomCreated');
      socket?.off('roomJoined');
      socket?.off('roomUpdated');
      socket?.off('gameStarted');
      socket?.off('attacked');
      socket?.off('defenseResult');
      socket?.off('error');
    };
  }, []);

  const createRoom = useCallback((nickname: string) => {
    setError(null);
    socket?.emit('createRoom', { nickname });
  }, []);

  const joinRoom = useCallback((roomId: string, nickname: string) => {
    setError(null);
    socket?.emit('joinRoom', { roomId, nickname });
  }, []);

  const startGame = useCallback((roomId: string) => {
    setError(null);
    socket?.emit('startGame', { roomId });
  }, []);

  const attack = useCallback((roomId: string, targetId: string, riskCardId: string) => {
    socket?.emit('attack', { roomId, targetId, riskCardId });
  }, []);

  const defend = useCallback((roomId: string, success: boolean, mitigationCardId?: string) => {
    socket?.emit('defend', { roomId, success, mitigationCardId });
  }, []);

  return {
    socketId: socket?.id,
    isConnected,
    room,
    error,
    createRoom,
    joinRoom,
    startGame,
    attack,
    defend,
  };
};
