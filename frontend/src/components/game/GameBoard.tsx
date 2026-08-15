"use client";

import { useTranslations } from "next-intl";
import { Card } from "../Card";
import { Room, Player } from "../../types/game.types";
import { useMitigationForm } from "./hooks/useMitigationForm";
import { AttackBanner } from "./board/AttackBanner";
import { DefenderActionPanel } from "./board/DefenderActionPanel";
import { AttackerActionPanel } from "./board/AttackerActionPanel";
import { SpectatorActionPanel } from "./board/SpectatorActionPanel";
import { TurnActionPanel } from "./board/TurnActionPanel";

interface GameBoardProps {
  room: Room;
  isMyTurn: boolean;
  amIAttacked: boolean;
  isAttacker?: boolean;
  selectedRisk: string | null;
  selectedTarget: string | null;
  handleAttack: () => void;
  handleFailDefend: () => void;
  handleProposeMitigation?: (description: string) => void;
  handleEvaluateMitigation?: (approved: boolean) => void;
}

export function GameBoard({
  room,
  isMyTurn,
  amIAttacked,
  isAttacker = false,
  selectedRisk,
  selectedTarget,
  handleAttack,
  handleFailDefend,
  handleProposeMitigation,
  handleEvaluateMitigation,
}: GameBoardProps) {
  const t = useTranslations("Game");

  const {
    isDescribing,
    mitigationText,
    setMitigationText,
    handleSubmit,
    startDescription,
    cancelDescription,
  } = useMitigationForm({
    room,
    onProposeMitigation: handleProposeMitigation,
  });

  const attackerPlayer = room.players.find(
    (p: Player) => p.id === room.currentAttack?.attackerId,
  );
  const targetPlayer = room.players.find(
    (p: Player) => p.id === room.currentAttack?.targetId,
  );
  const activeTurnPlayer = room.players[room.currentPlayerIndex];

  return (
    <main
      role="main"
      aria-label="Tabuleiro do Jogo"
      className="flex-1 bg-neutral-800/50 rounded-xl border-2 border-dashed border-neutral-700 p-4 md:p-6 flex flex-col items-center justify-center relative"
    >
      {room.currentAttack && (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 animate-in fade-in zoom-in duration-300 w-full max-w-4xl mx-auto">
          {/* Left Side: The Played Risk Card */}
          <div className="flex-shrink-0 relative group">
            <div
              className="absolute -inset-4 bg-red-500/20 rounded-full blur-xl animate-pulse -z-10"
              aria-hidden="true"
            />
            <Card
              type="risk"
              categoryId={room.currentAttack.riskCard.categoryId}
              descriptionId={room.currentAttack.riskCard.descriptionId}
            />
          </div>

          {/* Right Side: Attack & Defense Action Panel */}
          <div className="flex flex-col gap-4 text-center md:text-left flex-1 w-full max-w-lg">
            <AttackBanner
              attackerPlayer={attackerPlayer}
              targetPlayer={targetPlayer}
            />

            {amIAttacked && (
              <DefenderActionPanel
                proposedMitigation={room.currentAttack.proposedMitigation}
                isDescribing={isDescribing}
                mitigationText={mitigationText}
                onMitigationTextChange={setMitigationText}
                onStartDescription={startDescription}
                onCancelDescription={cancelDescription}
                onSubmitDescription={handleSubmit}
                onFailDefend={handleFailDefend}
              />
            )}

            {!amIAttacked && isAttacker && (
              <AttackerActionPanel
                proposedMitigation={room.currentAttack.proposedMitigation}
                onEvaluateMitigation={handleEvaluateMitigation}
              />
            )}

            {!amIAttacked && !isAttacker && (
              <SpectatorActionPanel
                proposedMitigation={room.currentAttack.proposedMitigation}
              />
            )}
          </div>
        </div>
      )}

      {!room.currentAttack && isMyTurn && (
        <TurnActionPanel
          selectedRisk={selectedRisk}
          selectedTarget={selectedTarget}
          onAttack={handleAttack}
        />
      )}

      {!room.currentAttack && !isMyTurn && (
        <section
          role="status"
          aria-live="polite"
          className="text-center text-neutral-500"
        >
          <p className="text-lg">
            {t("waitAttack")}{" "}
            <span className="text-neutral-300 font-medium">
              {activeTurnPlayer?.nickname || "..."}
            </span>
            ...
          </p>
        </section>
      )}
    </main>
  );
}
