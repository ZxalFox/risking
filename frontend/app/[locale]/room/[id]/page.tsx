"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useGame } from "../../../../src/context/GameContext";
import { Scoreboard } from "../../../../src/components/game/Scoreboard";
import { PlayerHand } from "../../../../src/components/game/PlayerHand";
import { OpponentList } from "../../../../src/components/game/OpponentList";
import { GameBoard } from "../../../../src/components/game/GameBoard";
import { MdContentCopy, MdCheck } from "react-icons/md";
import { Player } from "../../../../src/types/game.types";

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  use(params);
  const t = useTranslations("Game");
  const tLobby = useTranslations("Lobby");
  const router = useRouter();
  const {
    socketId,
    room,
    error,
    startGame,
    leaveRoom,
    endGame,
    clearRoom,
    attack,
    defend,
  } = useGame();

  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyRoomId = () => {
    if (!room?.id) return;
    navigator.clipboard.writeText(room.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Se não tem sala na memória do socket, volta pro início.
  // Isso acontece num refresh manual por enquanto.
  useEffect(() => {
    if (!room) {
      router.push("/");
    }
  }, [room, router]);

  if (!room) return null;

  const me = room.players.find((p: Player) => p.id === socketId);
  const isMyTurn =
    room.status === "playing" &&
    room.players[room.currentPlayerIndex]?.id === socketId;
  const amIAttacked = room.currentAttack?.targetId === socketId;

  const handleAttack = () => {
    if (selectedRisk && selectedTarget) {
      const realRiskId = selectedRisk.split("-")[0]; // Extrai o ID real da carta ignorando o index
      attack(room.id, selectedTarget, realRiskId);
      setSelectedRisk(null);
      setSelectedTarget(null);
    }
  };

  const handleAutoDefend = (mitigationCardId: string) => {
    defend(room.id, true, mitigationCardId);
  };

  const handleFailDefend = () => {
    defend(room.id, false);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 font-body">
      <header className="flex flex-col md:flex-row justify-between items-center bg-neutral-800 p-4 rounded-xl mb-4 md:mb-6 shadow-md gap-4 md:gap-0">
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-2xl font-heading font-bold text-orange-400">
            Risking!
          </h1>
          <p className="text-sm text-neutral-400 flex items-center gap-2">
            {t("roomId")}:{" "}
            <span className="font-mono text-white">{room.id}</span>
            <button
              onClick={handleCopyRoomId}
              className="hover:text-white transition-colors flex items-center justify-center bg-neutral-700/50 hover:bg-neutral-600 rounded-md p-1"
              title={t("copiedRoomId")}
            >
              {isCopied ? (
                <MdCheck className="text-emerald-400" size={14} />
              ) : (
                <MdContentCopy size={14} />
              )}
            </button>
          </p>
        </div>

        {room.status === "playing" && (
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto">
            <div className="text-center sm:text-right w-full sm:w-auto">
              <p className="font-semibold text-emerald-400">
                {t("round")}: {room.currentRound} / 4
              </p>
              {isMyTurn ? (
                <p className="text-lg font-bold text-orange-500 animate-pulse">
                  {t("yourTurn")}
                </p>
              ) : (
                <p className="text-neutral-400">
                  {t("waitingTurn")}{" "}
                  <span className="text-white">
                    {room.players[room.currentPlayerIndex]?.nickname}
                  </span>
                </p>
              )}
            </div>

            <div className="w-full sm:w-auto sm:border-l border-neutral-700 sm:pl-6 flex justify-center">
              {me?.isCreator ? (
                <button
                  onClick={() => endGame(room.id)}
                  className="w-full sm:w-auto bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white border border-red-800/50 hover:border-red-500 px-6 py-2 rounded-lg text-sm font-bold transition-all"
                >
                  Finalizar Partida
                </button>
              ) : (
                <button
                  onClick={() => leaveRoom(room.id)}
                  className="w-full sm:w-auto bg-neutral-700/50 hover:bg-red-600 text-neutral-300 hover:text-white border border-neutral-600 hover:border-red-500 px-6 py-2 rounded-lg text-sm font-bold transition-all"
                >
                  Sair da Partida
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded-lg mb-4">{error}</div>
      )}

      {room.status === "waiting" && (
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
      )}

      {room.status === "playing" && (
        <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-150px)] items-stretch">
          {/* Opponents Sidebar */}
          <OpponentList 
            players={room.players}
            socketId={socketId}
            isMyTurn={isMyTurn}
            selectedTarget={selectedTarget}
            setSelectedTarget={setSelectedTarget}
            tPlayers={t("players")}
            tRisks={t("risks")}
            tMitigations={t("mitigations")}
          />

          {/* Main Board */}
          <div className="flex-1 flex flex-col gap-6">
            <GameBoard
              room={room}
              isMyTurn={isMyTurn}
              amIAttacked={amIAttacked}
              selectedRisk={selectedRisk}
              selectedTarget={selectedTarget}
              handleAttack={handleAttack}
              handleFailDefend={handleFailDefend}
            />

            {/* My Hand */}
            {me && (
              <PlayerHand 
                room={room}
                me={me}
                isMyTurn={isMyTurn}
                amIAttacked={amIAttacked}
                selectedRisk={selectedRisk}
                setSelectedRisk={setSelectedRisk}
                handleAutoDefend={handleAutoDefend}
                tYourHand={t("yourHand")}
                tYourBalance={t("yourBalance")}
              />
            )}
          </div>
        </div>
      )}

      {room.status === "finished" && (
        <Scoreboard 
          room={room} 
          onGoHome={() => {
            clearRoom();
            router.push("/");
          }} 
          tTitle={t("gameFinished")}
          tDescription={t("finalScoreboard")}
          tButton={t("backToHome")}
        />
      )}
    </div>
  );
}
