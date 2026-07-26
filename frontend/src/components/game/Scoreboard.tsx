import { Room } from "../../types/game.types";

interface ScoreboardProps {
  room: Room;
  onGoHome: () => void;
  tTitle?: string;
  tDescription?: string;
  tButton?: string;
}

export function Scoreboard({ room, onGoHome, tTitle = "Fim de Jogo!", tDescription = "A partida foi encerrada. Confira o placar abaixo:", tButton = "Voltar ao Início" }: ScoreboardProps) {
  return (
    <div className="flex flex-col items-center justify-center pt-20 pb-20 px-4 h-full min-h-[60vh]">
      <div className="bg-neutral-900/90 border border-risk-primary/50 shadow-[0_0_40px_rgba(205,84,0,0.2)] p-10 rounded-3xl text-center max-w-lg w-full backdrop-blur-md animate-in zoom-in duration-500">
        <h2 className="text-4xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-red-600 mb-4">
          {tTitle}
        </h2>
        <p className="text-neutral-300 text-lg mb-8">
          {tDescription}
        </p>

        <ul className="space-y-4 mb-8">
          {[...room.players]
            .sort((a, b) => b.money - a.money)
            .map((p, i) => (
              <li
                key={p.id}
                className="flex justify-between items-center text-xl bg-neutral-950 px-6 py-4 rounded-xl border border-neutral-800"
              >
                <span className="text-white font-medium">
                  {i === 0 ? "👑 " : ""}
                  {p.nickname}
                </span>
                <span className="font-bold text-emerald-400 font-mono">
                  ${p.money}
                </span>
              </li>
            ))}
        </ul>

        <button
          onClick={onGoHome}
          className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-orange-500/30 transform hover:scale-105 active:scale-95 w-full"
        >
          {tButton}
        </button>
      </div>
    </div>
  );
}
