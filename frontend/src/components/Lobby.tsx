"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useGame } from "../context/GameContext";
import { useRouter } from "@/i18n/routing";

export function Lobby() {
  const t = useTranslations("Game");
  const { createRoom, joinRoom, room, error, isConnected } = useGame();
  const router = useRouter();

  const [nickname, setNickname] = useState("");
  const [roomId, setRoomId] = useState("");

  useEffect(() => {
    if (room?.id) {
      router.push(`/room/${room.id}`);
    }
  }, [room, router]);

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      {!isConnected && (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-md w-full max-w-sm mb-4">
          <p className="font-bold">Aviso</p>
          <p>O servidor não está conectado. Certifique-se de iniciar o backend.</p>
        </div>
      )}
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md border-t-4 border-orange-500">
        <h2 className="mb-4 text-2xl font-bold text-neutral-800 text-center">{t("createRoom")}</h2>
        <div className="flex flex-col gap-3">
          <input 
            type="text" 
            placeholder={t("nickname")}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-800"
          />
          <button 
            onClick={() => createRoom(nickname)}
            disabled={!nickname}
            className="w-full rounded-md bg-orange-600 px-4 py-2 text-white font-semibold hover:bg-orange-700 disabled:opacity-50"
          >
            {t("createRoom")}
          </button>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-md border-t-4 border-emerald-600">
        <h2 className="mb-4 text-2xl font-bold text-neutral-800 text-center">{t("joinRoom")}</h2>
        <div className="flex flex-col gap-3">
          <input 
            type="text" 
            placeholder={t("nickname")}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-800"
          />
          <input 
            type="text" 
            placeholder={t("roomId")}
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-neutral-800 uppercase"
          />
          <button 
            onClick={() => joinRoom(roomId.toUpperCase(), nickname)}
            disabled={!nickname || !roomId}
            className="w-full rounded-md bg-emerald-700 px-4 py-2 text-white font-semibold hover:bg-emerald-800 disabled:opacity-50"
          >
            {t("enter")}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 font-medium bg-red-100 p-2 rounded-md">{error}</p>}
    </div>
  );
}
