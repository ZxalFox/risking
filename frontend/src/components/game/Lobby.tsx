"use client";

import { useTranslations } from "next-intl";
import { MdContentCopy, MdCheck } from "react-icons/md";
import { Room, Player } from "../../types/game.types";

interface LobbyProps {
  room: Room;
  socketId?: string;
  isCopied: boolean;
  handleCopyRoomId: () => void;
  startGame: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
}

export function Lobby({
  room,
  socketId,
  isCopied,
  handleCopyRoomId,
  startGame,
  leaveRoom,
}: LobbyProps) {
  const t = useTranslations("Game");
  const tLobby = useTranslations("Lobby");

  const me = room.players.find((p: Player) => p.id === socketId);

  return (
    <div className="flex flex-col items-center justify-center pt-4 pb-20 px-2 sm:px-4">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-red-600 drop-shadow-md mb-3 pb-1">
          {tLobby("waiting")}
        </h2>
        <p className="text-neutral-400 font-mono bg-neutral-800/80 px-5 py-2 rounded-full border border-neutral-700 inline-flex items-center gap-3 shadow-inner">
          {tLobby("roomId")}{" "}
          <span className="text-white font-bold tracking-widest">
            {room.id}
          </span>
          <button
            onClick={handleCopyRoomId}
            className="text-neutral-400 hover:text-white transition-colors flex items-center justify-center bg-neutral-700/50 hover:bg-neutral-600 rounded-md p-1.5"
            title={t("copiedRoomId")}
          >
            {isCopied ? (
              <MdCheck className="text-emerald-400" size={16} />
            ) : (
              <MdContentCopy size={16} />
            )}
          </button>
        </p>
      </div>

      <div className="bg-neutral-800/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-neutral-700/50">
        <div className="flex justify-between items-center border-b border-neutral-700 pb-4 mb-6">
          <h3 className="text-2xl font-bold text-neutral-100">
            {tLobby("players")}
          </h3>
          <span className="bg-neutral-900 text-orange-400 px-3 py-1 rounded-full text-sm font-bold border border-neutral-700 shadow-inner">
            {room.players.length} / 5
          </span>
        </div>

        <ul className="space-y-3 mb-8">
          {room.players.map((p: Player) => (
            <li
              key={p.id}
              className="flex items-center gap-4 bg-neutral-900/50 border border-neutral-700/50 p-4 rounded-xl shadow-sm transition-all hover:bg-neutral-900/80"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-bold text-white shadow-md border border-neutral-800">
                {p.nickname.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-lg text-neutral-200 truncate">
                {p.nickname}{" "}
                {p.id === socketId ? (
                  <span className="text-neutral-500 text-sm ml-1">
                    ({tLobby("you")})
                  </span>
                ) : (
                  ""
                )}
              </span>
              {p.isCreator && (
                <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 px-3 py-1 rounded-full ml-auto font-bold uppercase tracking-wide">
                  {tLobby("host")}
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-4">
          {me?.isCreator ? (
            <>
              <button
                onClick={() => startGame(room.id)}
                disabled={room.players.length < 2}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {tLobby("startGame")}
              </button>
              {room.players.length < 2 && (
                <p className="text-center text-red-400 text-sm font-medium">
                  {tLobby("needMorePlayers")}
                </p>
              )}
            </>
          ) : (
            <div className="w-full bg-neutral-900/50 border border-neutral-700/50 text-neutral-400 text-center py-4 rounded-xl font-medium animate-pulse">
              {tLobby("waitingToStart")}
            </div>
          )}

          <button
            onClick={() => leaveRoom(room.id)}
            className="w-full bg-neutral-700/50 hover:bg-red-900/40 hover:text-red-300 hover:border-red-800/50 text-neutral-400 font-bold py-3 px-4 rounded-xl transition-all border border-transparent focus:outline-none"
          >
            {tLobby("leaveRoom")}
          </button>
        </div>
      </div>
    </div>
  );
}
