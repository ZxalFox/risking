"use client";

import { useTranslations } from "next-intl";

interface CardProps {
  type: "risk" | "mitigation";
  category: string;
  description?: string;
  onClick?: () => void;
  selected?: boolean;
}

export function Card({ type, category, description, onClick, selected }: CardProps) {
  const t = useTranslations("Game");
  
  const isRisk = type === "risk";
  
  return (
    <button 
      onClick={onClick}
      className={`
        w-40 h-56 rounded-xl p-3 flex flex-col justify-between text-left shadow-lg border-2 transition-all duration-300
        hover:-translate-y-2 active:translate-y-0
        ${selected ? 'ring-4 ring-orange-400 scale-105' : ''}
        ${isRisk 
          ? 'bg-gradient-to-br from-risk-primary to-risk-dark border-risk-dark text-white shadow-risk-primary/40 hover:shadow-risk-primary/60 hover:shadow-xl' 
          : 'bg-gradient-to-br from-mitigation-primary to-mitigation-dark border-mitigation-dark text-white shadow-mitigation-primary/40 hover:shadow-mitigation-primary/60 hover:shadow-xl'}
      `}
    >
      <div className="font-bold text-sm tracking-wider uppercase border-b border-white/30 pb-1">
        {isRisk ? "Risco" : "Mitigação"}
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center text-center mt-2">
        <span className="text-xs font-semibold bg-black/20 px-2 py-1 rounded-full mb-2">
          {category}
        </span>
        {description && (
          <p className="text-sm leading-tight mt-1">
            {description}
          </p>
        )}
      </div>
    </button>
  );
}
