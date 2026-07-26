"use client";

import { useTranslations } from "next-intl";
import { Card } from "../Card";
import { Room, Player } from "../../types/game.types";
import { ReactNode } from "react";

interface GameBoardProps {
  room: Room;
  isMyTurn: boolean;
  amIAttacked: boolean;
  selectedRisk: string | null;
  selectedTarget: string | null;
  handleAttack: () => void;
  handleFailDefend: () => void;
}

export function GameBoard({
  room,
  isMyTurn,
  amIAttacked,
  selectedRisk,
  selectedTarget,
  handleAttack,
  handleFailDefend,
}: GameBoardProps) {
  const t = useTranslations("Game");

  return (
    <div className="flex-1 bg-neutral-800/50 rounded-xl border-2 border-dashed border-neutral-700 p-4 md:p-6 flex flex-col items-center justify-center relative">
      {room.currentAttack && (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 animate-in fade-in zoom-in duration-300 w-full max-w-4xl mx-auto">
          {/* Left Side: The Card */}
          <div className="flex-shrink-0 relative group">
            <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-xl animate-pulse -z-10"></div>
            <Card
              type="risk"
              categoryId={room.currentAttack.riskCard.categoryId}
              descriptionId={room.currentAttack.riskCard.descriptionId}
            />
          </div>

          {/* Right Side: The Messages */}
          <div className="flex flex-col gap-4 text-center md:text-left flex-1 w-full max-w-md">
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.3)] flex flex-col justify-center">
              <h2 className="text-xl md:text-2xl font-bold mb-1">
                {t("attackInProgress")}
              </h2>
              <p className="text-sm md:text-base">
                <strong>
                  {
                    room.players.find(
                      (p: Player) =>
                        p.id === room.currentAttack?.attackerId,
                    )?.nickname
                  }
                </strong>{" "}
                {t("isAttacking")}{" "}
                <strong>
                  {
                    room.players.find(
                      (p: Player) => p.id === room.currentAttack?.targetId,
                    )?.nickname
                  }
                </strong>
              </p>
            </div>

            {amIAttacked ? (
              <div className="flex flex-col items-center md:items-start gap-3 bg-neutral-950/90 p-5 md:p-6 rounded-2xl border-2 border-risk-primary shadow-[0_0_30px_rgba(205,84,0,0.4)] animate-in fade-in slide-in-from-bottom-4 backdrop-blur-md">
                <p className="text-lg md:text-xl font-bold text-white">
                  {t("defendQuestion")}
                </p>
                <p className="text-neutral-300 text-xs md:text-sm">
                  {t.rich("defendInstructions", {
                    bold: (chunks: ReactNode) => <strong>{chunks}</strong>,
                  })}
                </p>

                <div className="w-full mt-2">
                  <button
                    onClick={handleFailDefend}
                    className="bg-neutral-900 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-neutral-700 hover:border-red-500/50 px-6 py-2.5 rounded-xl font-bold transition-all w-full shadow-inner text-sm flex items-center justify-center gap-2"
                  >
                    Aceitar Penalidade (-$5)
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-900/60 p-6 rounded-2xl border border-neutral-700 flex flex-col items-center justify-center min-h-[140px]">
                <div className="w-8 h-8 border-4 border-neutral-600 border-t-orange-500 rounded-full animate-spin mb-3"></div>
                <p className="text-neutral-400 font-medium text-sm md:text-base">
                  {t("waitingDefense")}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!room.currentAttack && isMyTurn && (
        <div className="text-center text-neutral-300 bg-neutral-900/50 p-6 rounded-2xl border border-risk-dark/50 shadow-inner">
          <p className="text-2xl font-bold text-white mb-4">
            {t("yourTurn")}
          </p>
          <div className="flex flex-col gap-2 text-lg mb-6">
            <p className="flex items-center justify-center gap-2">
              <span className="bg-risk-primary text-white w-6 h-6 rounded-full text-sm flex items-center justify-center font-bold">
                1
              </span>{" "}
              {t("stepSelectRisk")}
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="bg-risk-primary text-white w-6 h-6 rounded-full text-sm flex items-center justify-center font-bold">
                2
              </span>{" "}
              {t("stepSelectTarget")}
            </p>
          </div>
          <button
            onClick={handleAttack}
            disabled={!selectedRisk || !selectedTarget}
            className="bg-risk-primary hover:bg-orange-500 disabled:bg-neutral-800 text-white px-10 py-4 rounded-xl font-extrabold text-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(205,84,0,0.5)] disabled:shadow-none disabled:text-neutral-500 disabled:transform-none border border-transparent disabled:border-neutral-700"
          >
            CONFIRMAR ATAQUE
          </button>
        </div>
      )}

      {!room.currentAttack && !isMyTurn && (
        <div className="text-center text-neutral-500">
          <p className="text-lg">
            {t("waitAttack")}{" "}
            {room.players[room.currentPlayerIndex]?.nickname}...
          </p>
        </div>
      )}
    </div>
  );
}
