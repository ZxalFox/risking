import { Player } from "../../types/game.types";

interface OpponentListProps {
  players: Player[];
  socketId: string | undefined;
  isMyTurn: boolean;
  selectedTarget: string | null;
  setSelectedTarget: (id: string | null) => void;
  tPlayers?: string;
  tRisks?: string;
  tMitigations?: string;
}

export function OpponentList({
  players,
  socketId,
  isMyTurn,
  selectedTarget,
  setSelectedTarget,
  tPlayers = "Players",
  tRisks = "Risks",
  tMitigations = "Mitigations",
}: OpponentListProps) {
  return (
    <div className="w-full lg:w-72 bg-neutral-900/80 rounded-2xl p-5 flex flex-col gap-4 shadow-2xl border border-neutral-700/50 backdrop-blur-sm shrink-0 lg:sticky lg:top-4 lg:max-h-[calc(100vh-32px)] overflow-y-auto self-start">
      <h3 className="font-heading text-xl font-bold text-neutral-100 border-b border-neutral-700/80 pb-3">
        {tPlayers}
      </h3>
      {players
        .filter((p) => p.id !== socketId)
        .map((p) => (
          <div
            key={p.id}
            onClick={() => isMyTurn && setSelectedTarget(p.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
              selectedTarget === p.id
                ? "border-risk-primary bg-risk-dark/30 shadow-[0_0_15px_rgba(205,84,0,0.2)] scale-[1.02]"
                : "border-transparent bg-neutral-800/60 hover:bg-neutral-700/80 hover:border-neutral-600"
            }`}
          >
            <div className="font-bold flex justify-between items-center mb-1">
              <span className="text-lg text-white">{p.nickname}</span>
              <span className="text-emerald-400 font-mono font-bold text-lg drop-shadow-sm">
                ${p.money}
              </span>
            </div>
            <div className="text-xs text-neutral-400 flex justify-between font-medium">
              <span className="bg-risk-dark/50 text-risk-light px-2 py-1 rounded-md">
                {tRisks} {p.riskCards.length}
              </span>
              <span className="bg-mitigation-dark/50 text-mitigation-light px-2 py-1 rounded-md">
                {tMitigations} {p.mitigationCards.length}
              </span>
            </div>
          </div>
        ))}
    </div>
  );
}
