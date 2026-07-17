"use client";

import { useTranslations } from "next-intl";
import { 
  FaTasks, 
  FaSitemap, 
  FaUserTie, 
  FaServer, 
  FaUsersCog, 
  FaLaptopCode, 
  FaProjectDiagram, 
  FaUserClock, 
  FaUserShield, 
  FaNetworkWired 
} from 'react-icons/fa';

interface CardProps {
  type: "risk" | "mitigation";
  categoryId: string;
  descriptionId?: string;
  onClick?: () => void;
  selected?: boolean;
}

const CategoryIcon: Record<string, any> = {
  "task": FaTasks,
  "structure": FaSitemap,
  "actor": FaUserTie,
  "technology": FaServer,
  "task_actor": FaUsersCog,
  "task_technology": FaLaptopCode,
  "structure_task": FaProjectDiagram,
  "actor_technology": FaUserClock,
  "actor_structure": FaUserShield,
  "structure_technology": FaNetworkWired
};

export function Card({ type, categoryId, descriptionId, onClick, selected }: CardProps) {
  const t = useTranslations("Card");
  const tCat = useTranslations("Categories");
  const tRisk = useTranslations("Risks");
  const tMit = useTranslations("Mitigations");
  
  const isRisk = type === "risk";
  const safeCategoryId = categoryId || "unknown";
  const safeDescriptionId = descriptionId || "unknown";
  const Icon = CategoryIcon[safeCategoryId] || FaTasks;
  
  return (
    <button 
      onClick={onClick}
      className={`
        shrink-0 w-44 h-64 rounded-xl p-4 flex flex-col justify-between text-left shadow-lg border-2 transition-all duration-300
        hover:-translate-y-2 active:translate-y-0 relative overflow-hidden group
        ${selected ? 'ring-4 ring-orange-400 scale-105' : ''}
        ${isRisk 
          ? 'bg-gradient-to-br from-risk-primary to-risk-dark border-risk-dark text-white shadow-risk-primary/40 hover:shadow-risk-primary/60 hover:shadow-xl' 
          : 'bg-gradient-to-br from-mitigation-primary to-mitigation-dark border-mitigation-dark text-white shadow-mitigation-primary/40 hover:shadow-mitigation-primary/60 hover:shadow-xl'}
      `}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform translate-x-4 -translate-y-2">
        <Icon size={120} />
      </div>

      <div className="font-bold text-sm tracking-wider uppercase border-b border-white/30 pb-1 flex items-center gap-2 relative z-10">
        <Icon size={16} />
        {isRisk ? t("risk") : t("mitigation")}
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center text-center mt-2 relative z-10">
        <span className="text-xs font-semibold bg-black/40 border border-white/10 px-3 py-1 rounded-full mb-3 flex items-center gap-2 shadow-inner">
          <Icon size={12} className="opacity-70" />
          {tCat(safeCategoryId)}
        </span>
        
        {isRisk ? (
          <p className="text-sm leading-tight mt-1 font-medium text-white/90 text-center">
            {tRisk(safeDescriptionId)}
          </p>
        ) : (
          <ul className="text-xs leading-tight mt-1 font-medium text-white/90 text-left list-disc list-outside ml-3 space-y-1">
            {tMit(safeCategoryId)
              .split(/(?=\d+\.\s)/)
              .filter((s: string) => s.trim().length > 0)
              .map((item: string, i: number) => (
                <li key={i}>{item.replace(/^\d+\.\s/, '').trim()}</li>
              ))}
          </ul>
        )}
      </div>
    </button>
  );
}
