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
      const realRiskId = selectedRisk.split('-')[0]; // Extrai o ID real da carta ignorando o index
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
          <div className="w-full md:w-64 bg-neutral-900/80 rounded-2xl p-5 flex flex-col gap-4 overflow-y-auto shadow-2xl border border-neutral-700/50 backdrop-blur-sm">
            <h3 className="font-heading text-xl font-bold text-neutral-100 border-b border-neutral-700/80 pb-3">{t("players")}</h3>
            {room.players.filter((p:any) => p.id !== socketId).map((p: any) => (
              <div 
                key={p.id} 
                onClick={() => isMyTurn && setSelectedTarget(p.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedTarget === p.id 
                    ? 'border-risk-primary bg-risk-dark/30 shadow-[0_0_15px_rgba(205,84,0,0.2)] scale-[1.02]' 
                    : 'border-transparent bg-neutral-800/60 hover:bg-neutral-700/80 hover:border-neutral-600'
                }`}
              >
                <div className="font-bold flex justify-between items-center mb-1">
                  <span className="text-lg text-white">{p.nickname}</span>
                  <span className="text-emerald-400 font-mono font-bold text-lg drop-shadow-sm">${p.money}</span>
                </div>
                <div className="text-xs text-neutral-400 flex justify-between font-medium">
                  <span className="bg-risk-dark/50 text-risk-light px-2 py-1 rounded-md">Riscos: {p.riskCards.length}</span>
                  <span className="bg-mitigation-dark/50 text-mitigation-light px-2 py-1 rounded-md">Mitig: {p.mitigationCards.length}</span>
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
                    <div className="flex flex-col items-center gap-4 bg-neutral-950/90 p-8 rounded-2xl border-2 border-risk-primary shadow-[0_0_30px_rgba(205,84,0,0.4)] animate-in fade-in slide-in-from-bottom-4 backdrop-blur-md mt-4">
                      <p className="text-2xl font-bold text-white text-center">{t("defendQuestion")}</p>
                      <p className="text-neutral-300 text-center text-lg mt-1 mb-4 max-w-md">
                        Clique em uma <strong>Carta de Mitigação</strong> da sua mão abaixo que corresponda à categoria do ataque, ou aceite a penalidade se não tiver defesas.
                      </p>
                      
                      <div className="flex justify-center w-full">
                        <button onClick={handleFailDefend} className="bg-neutral-900 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-neutral-700 hover:border-red-500/50 px-8 py-3 rounded-xl font-bold transition-all w-full sm:w-auto shadow-inner">
                          Aceitar Ataque (-$5)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!room.currentAttack && isMyTurn && (
                <div className="text-center text-neutral-300 bg-neutral-900/50 p-6 rounded-2xl border border-risk-dark/50 shadow-inner">
                  <p className="text-2xl font-bold text-white mb-4">{t("yourTurn")}</p>
                  <div className="flex flex-col gap-2 text-lg mb-6">
                    <p className="flex items-center justify-center gap-2"><span className="bg-risk-primary text-white w-6 h-6 rounded-full text-sm flex items-center justify-center font-bold">1</span> Selecione uma Carta de Risco da sua mão</p>
                    <p className="flex items-center justify-center gap-2"><span className="bg-risk-primary text-white w-6 h-6 rounded-full text-sm flex items-center justify-center font-bold">2</span> Selecione um Alvo no painel ao lado</p>
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
                  <p className="text-lg">Aguarde o ataque de {room.players[room.currentPlayerIndex]?.nickname}...</p>
                </div>
              )}
            </div>

            {/* My Hand */}
            <div className="bg-neutral-900/80 rounded-2xl p-5 shadow-2xl border border-neutral-700/50 backdrop-blur-sm">
              <div className="flex justify-between items-center border-b border-neutral-700/80 pb-3 mb-5">
                <h3 className="font-heading text-xl font-bold text-neutral-100">Sua Mão</h3>
                <div className="flex items-center gap-3">
                  <span className="text-neutral-400 font-medium text-sm">Seu Saldo</span>
                  <span className="bg-mitigation-dark/30 text-emerald-400 border border-emerald-800/50 px-5 py-2 rounded-xl font-mono font-bold text-xl drop-shadow-md shadow-inner">
                    ${me?.money}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {/* Risk Cards */}
                {me?.riskCards.map((c: any, index: number) => {
                  const uniqueId = `${c.id}-${index}`;
                  return (
                    <Card 
                      key={uniqueId} 
                      type="risk" 
                      category={c.category} 
                      description={c.description}
                      selected={selectedRisk === uniqueId}
                      onClick={() => isMyTurn && !room.currentAttack && setSelectedRisk(uniqueId === selectedRisk ? null : uniqueId)}
                    />
                  );
                })}

                <div className="w-px bg-neutral-700 mx-2 self-stretch"></div>

                {/* Mitigation Cards */}
                {me?.mitigationCards.map((c: any, index: number) => (
                  <Card 
                    key={`${c.id}-${index}`} 
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
