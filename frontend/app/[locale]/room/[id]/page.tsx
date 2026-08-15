"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useGame } from "../../../../src/context/GameContext";
import { Lobby } from "../../../../src/components/game/Lobby";
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
    proposeMitigation,
    evaluateMitigation,
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
  const isAttacker = room.currentAttack?.attackerId === socketId;

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

  const handleProposeMitigation = (description: string) => {
    proposeMitigation(room.id, description);
  };

  const handleEvaluateMitigation = (approved: boolean) => {
    evaluateMitigation(room.id, approved);
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
        <Lobby
          room={room}
          socketId={socketId}
          isCopied={isCopied}
          handleCopyRoomId={handleCopyRoomId}
          startGame={startGame}
          leaveRoom={leaveRoom}
        />
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
              isAttacker={isAttacker}
              selectedRisk={selectedRisk}
              selectedTarget={selectedTarget}
              handleAttack={handleAttack}
              handleFailDefend={handleFailDefend}
              handleProposeMitigation={handleProposeMitigation}
              handleEvaluateMitigation={handleEvaluateMitigation}
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
