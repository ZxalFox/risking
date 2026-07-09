"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useGame } from "@/context/GameContext";

type PageParams = Promise<{ locale: string }>;

export default function HomePage({ params }: { params: PageParams }) {
  const { locale } = use(params);
  const t = useTranslations("HomePage");
  const router = useRouter();
  
  const { createRoom, joinRoom, room, error, isConnected } = useGame();

  const [nickname, setNickname] = useState("");
  const [roomId, setRoomId] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  // Redireciona para a sala assim que ela for criada ou acessada no contexto
  useEffect(() => {
    if (room && room.id) {
      router.push(`/room/${room.id}`);
    }
  }, [room, router]);

  const handleCreateRoom = () => {
    setLocalError(null);
    if (!nickname.trim()) {
      setLocalError(t("errorNicknameRequired"));
      return;
    }
    createRoom(nickname.trim());
  };

  const handleJoinRoom = () => {
    setLocalError(null);
    if (!nickname.trim()) {
      setLocalError(t("errorNicknameRequired"));
      return;
    }
    if (!roomId.trim()) {
      setLocalError(t("errorRoomIdRequired"));
      return;
    }
    joinRoom(roomId.trim(), nickname.trim());
  };

  return (
    <main className="min-h-screen bg-neutral-900 flex items-center justify-center p-6 font-body text-white">
      <div className="max-w-md w-full bg-neutral-800 rounded-2xl shadow-2xl p-8 border border-neutral-700">
        
        <header className="text-center mb-10">
          <h1 className="text-6xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-red-600 drop-shadow-lg mb-2 pb-2">
            {t("heading")}
          </h1>
          <p className="text-neutral-400">
            {t("subheading")}
          </p>
        </header>

        <div className="space-y-6">
          
          {(localError || error) && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-lg text-sm font-medium text-center" role="alert">
              {localError || error}
            </div>
          )}

          {!isConnected && !error && (
            <div className="bg-amber-500/10 border border-amber-500 text-amber-400 p-3 rounded-lg text-sm font-medium text-center" role="alert">
              Conectando ao servidor...
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="nickname" className="text-sm font-semibold text-neutral-300 block">
              Nickname
            </label>
            <input
              id="nickname"
              type="text"
              placeholder={t("nicknamePlaceholder")}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-risk-primary focus:border-transparent transition-all"
              autoComplete="off"
            />
          </div>

          <div className="pt-4 border-t border-neutral-700 space-y-4">
            <button
              onClick={handleCreateRoom}
              disabled={!isConnected}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {t("createRoom")}
            </button>
            
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-neutral-700"></div>
              <span className="text-xs font-bold text-neutral-500">{t("or")}</span>
              <div className="flex-1 h-px bg-neutral-700"></div>
            </div>

            <div className="flex flex-col gap-3">
              <input
                id="roomId"
                type="text"
                placeholder={t("roomIdPlaceholder")}
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toLowerCase())}
                className="w-full bg-neutral-900 border border-neutral-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-mono"
                autoComplete="off"
              />
              <button
                onClick={handleJoinRoom}
                disabled={!isConnected || !roomId.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {t("joinRoom")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
