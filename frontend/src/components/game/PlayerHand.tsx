import { Card } from "../Card";
import { Player, Room } from "../../types/game.types";

interface PlayerHandProps {
  room: Room;
  me: Player;
  isMyTurn: boolean;
  amIAttacked: boolean;
  selectedRisk: string | null;
  setSelectedRisk: (id: string | null) => void;
  handleAutoDefend: (id: string) => void;
  tYourHand?: string;
  tYourBalance?: string;
}

export function PlayerHand({ 
  room, 
  me, 
  isMyTurn, 
  amIAttacked, 
  selectedRisk, 
  setSelectedRisk, 
  handleAutoDefend, 
  tYourHand = "Your Hand", 
  tYourBalance = "Your Balance" 
}: PlayerHandProps) {
  return (
    <div className="bg-neutral-900/80 rounded-2xl p-5 shadow-2xl border border-neutral-700/50 backdrop-blur-sm">
      <div className="flex justify-between items-center border-b border-neutral-700/80 pb-3 mb-5">
        <h3 className="font-heading text-xl font-bold text-neutral-100">
          {tYourHand}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-neutral-400 font-medium text-sm">
            {tYourBalance}
          </span>
          <span className="bg-mitigation-dark/30 text-emerald-400 border border-emerald-800/50 px-5 py-2 rounded-xl font-mono font-bold text-xl drop-shadow-md shadow-inner">
            ${me?.money}
          </span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pt-4 pb-8 px-2 custom-scrollbar -mx-2">
        {/* Risk Cards */}
        {me?.riskCards.map((c, index) => {
          const uniqueId = `${c.id}-${index}`;
          return (
            <Card
              key={uniqueId}
              type="risk"
              categoryId={c.categoryId}
              descriptionId={c.descriptionId}
              selected={selectedRisk === uniqueId}
              onClick={() =>
                isMyTurn &&
                !room.currentAttack &&
                setSelectedRisk(
                  uniqueId === selectedRisk ? null : uniqueId,
                )
              }
            />
          );
        })}

        <div className="w-px bg-neutral-700 mx-2 self-stretch"></div>

        {/* Mitigation Cards */}
        {me?.mitigationCards.map((c, index) => (
          <Card
            key={`${c.id}-${index}`}
            type="mitigation"
            categoryId={c.categoryId}
            onClick={() => amIAttacked && handleAutoDefend(c.id)}
          />
        ))}
      </div>
    </div>
  );
}
