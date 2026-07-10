"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useGame } from "../../../../src/context/GameContext";
import { Card } from "../../../../src/components/Card";

export default function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("Game");
  const tLobby = useTranslations("Lobby");
  const router = useRouter();
  const { room, socketId, startGame, leaveRoom, attack, defend, error } = useGame();

  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  // Se não tem sala na memória do socket, volta pro início.
  // Isso acontece num refresh manual por enquanto.
  useEffect(() => {
    if (!room) {
      router.push("/");
    }
  }, [room, router]);

  if (!room) return null;

  const me = room.players.find((p: any) => p.id === socketId);
  const isMyTurn = room.status === "playing" && room.players[room.currentPlayerIndex]?.id === socketId;
  const amIAttacked = room.currentAttack?.targetId === socketId;

  const handleAttack = () => {
    if (selectedRisk && selectedTarget) {
      attack(room.id, selectedTarget, selectedRisk);
      setSelectedRisk(null);
      setSelectedTarget(null);
    }
  };

  const handleAutoDefend = (mitigationCardId: string) => {
    defend(room.id, true, mitigationCardId);
  };

  const handleExplainDefend = () => {
    // In a full game, other players would vote. 
    // For MVP, we'll just simulate a successful defense if they click explain.
    defend(room.id, true);
  };

  const handleFailDefend = () => {
    defend(room.id, false);
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6 font-body">
      <header className="flex justify-between items-center bg-neutral-800 p-4 rounded-xl mb-6 shadow-md">
        <div>
          <h1 className="text-2xl font-heading font-bold text-orange-400">Risking!</h1>
          <p className="text-sm text-neutral-400">{t("roomId")}: <span className="font-mono text-white">{room.id}</span></p>
        </div>
        
        {room.status === "playing" && (
          <div className="text-right">
            <p className="font-semibold text-emerald-400">{t("round")}: {room.currentRound} / 4</p>
            {isMyTurn ? (
              <p className="text-lg font-bold text-orange-500 animate-pulse">{t("yourTurn")}</p>
            ) : (
              <p className="text-neutral-400">{t("waitingTurn")} <span className="text-white">{room.players[room.currentPlayerIndex]?.nickname}</span></p>
            )}
          </div>
        )}
      </header>

      {error && <div className="bg-red-500 text-white p-3 rounded-lg mb-4">{error}</div>}

      {room.status === "waiting" && (
        <div className="flex flex-col items-center justify-center pt-4 pb-20 px-2 sm:px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-red-600 drop-shadow-md mb-3 pb-1">{tLobby("waiting")}</h2>
            <p className="text-neutral-400 font-mono bg-neutral-800/80 px-5 py-2 rounded-full border border-neutral-700 inline-block shadow-inner">
              {tLobby("roomId")} <span className="text-white font-bold tracking-widest ml-2">{room.id}</span>
            </p>
          </div>
          
          <div className="bg-neutral-800/80 backdrop-blur-md p-6 sm:p-8 rounded-2xl w-full max-w-lg shadow-2xl border border-neutral-700/50">
            <div className="flex justify-between items-center border-b border-neutral-700 pb-4 mb-6">
              <h3 className="text-2xl font-bold text-neutral-100">{tLobby("players")}</h3>
              <span className="bg-neutral-900 text-orange-400 px-3 py-1 rounded-full text-sm font-bold border border-neutral-700 shadow-inner">
                {room.players.length} / 5
              </span>
            </div>
            
            <ul className="space-y-3 mb-8">
              {room.players.map((p: any) => (
                <li key={p.id} className="flex items-center gap-4 bg-neutral-900/50 border border-neutral-700/50 p-4 rounded-xl shadow-sm transition-all hover:bg-neutral-900/80">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center font-bold text-white shadow-md border border-neutral-800">
                    {p.nickname.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-lg text-neutral-200 truncate">
                    {p.nickname} {p.id === socketId ? <span className="text-neutral-500 text-sm ml-1">({tLobby("you")})</span> : ""}
                  </span>
                  {p.isCreator && <span className="text-xs bg-emerald-900/40 text-emerald-400 border border-emerald-800/50 px-3 py-1 rounded-full ml-auto font-bold uppercase tracking-wide">{tLobby("host")}</span>}
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
                    <p className="text-center text-red-400 text-sm font-medium">{tLobby("needMorePlayers")}</p>
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
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)]">
          
          {/* Opponents Sidebar */}
          <div className="w-full md:w-64 bg-neutral-800 rounded-xl p-4 flex flex-col gap-4 overflow-y-auto shadow-inner border border-neutral-700">
            <h3 className="font-heading text-lg border-b border-neutral-700 pb-2">{t("players")}</h3>
            {room.players.filter((p:any) => p.id !== socketId).map((p: any) => (
              <div 
                key={p.id} 
                onClick={() => isMyTurn && setSelectedTarget(p.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedTarget === p.id ? 'border-orange-500 bg-neutral-700' : 'border-transparent bg-neutral-900 hover:bg-neutral-700'
                }`}
              >
                <div className="font-bold flex justify-between">
                  <span>{p.nickname}</span>
                  <span className="text-emerald-400">${p.money}</span>
                </div>
                <div className="text-xs text-neutral-400 mt-2 flex justify-between">
                  <span>Riscos: {p.riskCards.length}</span>
                  <span>Mitig: {p.mitigationCards.length}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Main Board */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Action Area (Attacked or Attacking) */}
            <div className="flex-1 bg-neutral-800/50 rounded-xl border-2 border-dashed border-neutral-700 p-6 flex flex-col items-center justify-center relative">
              
              {room.currentAttack && (
                <div className="text-center animate-in fade-in zoom-in duration-300">
                  <div className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl mb-6 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                    <h2 className="text-2xl font-bold mb-2">Ataque em andamento!</h2>
                    <p className="text-lg">
                      {room.players.find((p:any)=>p.id===room.currentAttack.attackerId)?.nickname} está atacando {room.players.find((p:any)=>p.id===room.currentAttack.targetId)?.nickname}
                    </p>
                  </div>
                  
                  <div className="flex justify-center mb-6">
                    <Card type="risk" category={room.currentAttack.riskCard.category} description={room.currentAttack.riskCard.description} />
                  </div>

                  {amIAttacked && (
                    <div className="flex flex-col items-center gap-4 bg-neutral-900 p-6 rounded-2xl border border-orange-500 shadow-2xl">
                      <p className="text-xl font-bold">{t("defendQuestion")}</p>
                      
                      <div className="flex flex-wrap gap-4 justify-center mt-2">
                        <button onClick={handleExplainDefend} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          {t("explainDefend")} (MVP Simulado)
                        </button>
                        <button onClick={handleFailDefend} className="bg-neutral-600 hover:bg-neutral-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                          Aceitar Ataque (Pagar 5)
                        </button>
                      </div>

                      <p className="text-sm text-neutral-400 mt-2">Ou selecione uma Carta de Mitigação compatível nas suas cartas abaixo.</p>
                    </div>
                  )}
                </div>
              )}

              {!room.currentAttack && isMyTurn && (
                <div className="text-center text-neutral-400">
                  <p className="text-xl mb-2">Sua vez de atacar!</p>
                  <p>1. Selecione uma Carta de Risco da sua mão</p>
                  <p>2. Selecione um Alvo no painel ao lado</p>
                  <button 
                    onClick={handleAttack}
                    disabled={!selectedRisk || !selectedTarget}
                    className="mt-6 bg-orange-600 hover:bg-orange-500 disabled:bg-neutral-700 text-white px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg disabled:shadow-none disabled:transform-none"
                  >
                    CONFIRMAR ATAQUE
                  </button>
                </div>
              )}

              {!room.currentAttack && !isMyTurn && (
                <div className="text-center text-neutral-500">
                  <p className="text-lg">Aguarde o ataque de {room.players[room.currentPlayerIndex]?.nickname}...</p>
                </div>
              )}
            </div>

            {/* My Hand */}
            <div className="bg-neutral-800 rounded-xl p-4 shadow-md border border-neutral-700">
              <div className="flex justify-between items-center border-b border-neutral-700 pb-2 mb-4">
                <h3 className="font-heading text-lg">Sua Mão</h3>
                <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-800 px-4 py-1 rounded-full font-bold text-lg">
                  {t("money")}: ${me?.money}
                </span>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {/* Risk Cards */}
                {me?.riskCards.map((c: any) => (
                  <Card 
                    key={c.id} 
                    type="risk" 
                    category={c.category} 
                    description={c.description}
                    selected={selectedRisk === c.id}
                    onClick={() => isMyTurn && !room.currentAttack && setSelectedRisk(c.id === selectedRisk ? null : c.id)}
                  />
                ))}

                <div className="w-px bg-neutral-700 mx-2 self-stretch"></div>

                {/* Mitigation Cards */}
                {me?.mitigationCards.map((c: any) => (
                  <Card 
                    key={c.id} 
                    type="mitigation" 
                    category={c.category} 
                    description={"Protege contra: " + c.category}
                    onClick={() => amIAttacked && handleAutoDefend(c.id)}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {room.status === "finished" && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in">
          <h2 className="text-5xl font-extrabold text-orange-500 mb-6 drop-shadow-lg">Fim de Jogo!</h2>
          <div className="bg-neutral-800 p-8 rounded-2xl border-2 border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
            <h3 className="text-2xl font-bold mb-6">Placar Final</h3>
            <ul className="space-y-4">
              {[...room.players].sort((a:any, b:any) => b.money - a.money).map((p:any, i:number) => (
                <li key={p.id} className="flex justify-between items-center text-xl bg-neutral-900 px-6 py-4 rounded-lg">
                  <span>{i === 0 ? "👑 " : ""}{p.nickname}</span>
                  <span className="font-bold text-emerald-400">${p.money}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => router.push("/")} className="mt-8 bg-neutral-700 hover:bg-neutral-600 px-6 py-3 rounded-full font-bold transition-colors">
              Voltar ao Início
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
