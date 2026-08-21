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
  FaNetworkWired,
  FaShieldAlt,
  FaExclamationTriangle
} from 'react-icons/fa';

import { ElementType } from 'react';

interface CardProps {
  type: "risk" | "mitigation";
  categoryId: string;
  descriptionId?: string;
  onClick?: () => void;
  selected?: boolean;
}

const CategoryIcon: Record<string, ElementType> = {
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

function parseMitigations(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\d\./)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function getCardThemeStyles(isRisk: boolean, selected?: boolean): string {
  if (isRisk) {
    const selectedStyle = selected ? "ring-4 ring-orange-300 scale-105 shadow-[0_0_25px_rgba(255,160,50,0.7)]" : "";
    return `bg-gradient-to-b from-[#a33b00] via-[#5c1c00] to-[#260900] border-orange-500/80 hover:border-orange-400 text-white shadow-[0_8px_20px_rgba(205,84,0,0.35)] hover:shadow-[0_12px_28px_rgba(205,84,0,0.55)] focus-visible:ring-orange-400 ${selectedStyle}`;
  }
  const selectedStyle = selected ? "ring-4 ring-emerald-300 scale-105 shadow-[0_0_25px_rgba(80,240,160,0.7)]" : "";
  return `bg-gradient-to-b from-[#245e4a] via-[#153e30] to-[#0a2018] border-emerald-400/80 hover:border-emerald-300 text-white shadow-[0_8px_20px_rgba(46,109,85,0.35)] hover:shadow-[0_12px_28px_rgba(46,109,85,0.55)] focus-visible:ring-emerald-400 ${selectedStyle}`;
}

export function Card({ type, categoryId, descriptionId, onClick, selected }: CardProps) {
  const t = useTranslations("Card");
  const tCat = useTranslations("Categories");
  const tRisk = useTranslations("Risks");
  const tMit = useTranslations("Mitigations");
  const tRiskMit = useTranslations("RiskMitigations");
  
  const isRisk = type === "risk";
  const safeCategoryId = categoryId || "unknown";
  const safeDescriptionId = descriptionId || "unknown";
  const Icon = CategoryIcon[safeCategoryId] || FaTasks;

  let rawMitigations = "";
  if (isRisk) {
    try {
      rawMitigations = tRiskMit(safeDescriptionId);
    } catch {
      rawMitigations = "";
    }
  }

  const mitigationsList = parseMitigations(rawMitigations);
  const categoryMitigations = isRisk ? [] : parseMitigations(tMit(safeCategoryId));

  const formattedMitigationsList = mitigationsList
    .map((m, i) => `${i + 1}. ${m}`)
    .join("\n");

  const riskTitle = isRisk && mitigationsList.length > 0
    ? `${t("risk")}: ${tRisk(safeDescriptionId)}\n\n${t("validMitigations")}:\n${formattedMitigationsList}`
    : undefined;

  const cardAriaLabel = isRisk
    ? `${t("risk")}: ${tRisk(safeDescriptionId)}`
    : `${t("mitigation")}: ${tCat(safeCategoryId)}`;

  const themeClasses = getCardThemeStyles(isRisk, selected);

  return (
    <button 
      type="button"
      onClick={onClick}
      title={riskTitle}
      aria-label={cardAriaLabel}
      className={`
        shrink-0 w-44 h-64 rounded-xl p-4 flex flex-col justify-between text-left shadow-lg border-2 transition-all duration-300
        hover:-translate-y-2 active:translate-y-0 relative overflow-hidden group focus-visible:outline-none focus-visible:ring-4
        ${themeClasses}
      `}
    >
      {/* Background Watermark Icon */}
      <div 
        className={`
          absolute top-0 right-0 p-4 transition-opacity transform translate-x-4 -translate-y-2 pointer-events-none
          ${isRisk ? "text-orange-200 opacity-15 group-hover:opacity-25" : "text-emerald-200 opacity-15 group-hover:opacity-25"}
        `}
        aria-hidden="true"
      >
        <Icon size={120} />
      </div>

      {/* Card Header Badge */}
      <div className={`
        font-bold text-xs tracking-wider uppercase px-2.5 py-1 rounded-md border flex items-center justify-between relative z-10 shadow-sm
        ${isRisk 
          ? "bg-orange-950/90 border-orange-400/40 text-orange-200" 
          : "bg-emerald-950/90 border-emerald-400/40 text-emerald-200"}
      `}>
        <div className="flex items-center gap-1.5 font-extrabold">
          {isRisk ? (
            <FaExclamationTriangle size={13} className="text-orange-400 shrink-0" aria-hidden="true" />
          ) : (
            <FaShieldAlt size={13} className="text-emerald-400 shrink-0" aria-hidden="true" />
          )}
          <span>{isRisk ? t("risk") : t("mitigation")}</span>
        </div>
        <Icon size={13} className={isRisk ? "text-orange-300 opacity-80" : "text-emerald-300 opacity-80"} aria-hidden="true" />
      </div>
      
      {/* Card Body Content */}
      <div className="flex-1 flex flex-col justify-center items-center text-center mt-2 relative z-10">
        <span className={`
          text-xs font-semibold px-3 py-1 rounded-full mb-2.5 flex items-center gap-1.5 shadow-inner border
          ${isRisk 
            ? "bg-black/60 border-orange-400/30 text-orange-200" 
            : "bg-black/60 border-emerald-400/30 text-emerald-200"}
        `}>
          <Icon size={11} className="opacity-80" aria-hidden="true" />
          <span>{tCat(safeCategoryId)}</span>
        </span>
        
        {isRisk ? (
          <p className="text-sm leading-snug mt-1 font-semibold text-white text-center drop-shadow-sm">
            {tRisk(safeDescriptionId)}
          </p>
        ) : (
          <ul className="text-xs leading-tight mt-1 font-medium text-white/95 text-left list-disc list-outside ml-3 space-y-1 drop-shadow-sm">
            {categoryMitigations.map((item: string, i: number) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Feature 2: Tooltip / Verso de Mitigações Válidas no Hover */}
      {isRisk && mitigationsList.length > 0 && (
        <div
          role="tooltip"
          className="
            absolute inset-0 bg-neutral-950/95 rounded-xl p-3.5 flex flex-col justify-between z-30
            opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100
            transition-all duration-300 ease-out border-2 border-emerald-500/80 shadow-2xl
            text-left backdrop-blur-md overflow-hidden pointer-events-none group-hover:pointer-events-auto
          "
        >
          <div className="overflow-y-auto max-h-full pr-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 border-b border-neutral-700/80 pb-1.5 mb-2">
              <FaShieldAlt size={13} className="text-emerald-400 shrink-0" aria-hidden="true" />
              <span>{t("validMitigations")}</span>
            </div>
            <ul className="text-xs text-neutral-200 list-disc list-outside ml-3.5 space-y-1.5 leading-snug">
              {mitigationsList.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="pt-2 border-t border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between shrink-0">
            <span>{tCat(safeCategoryId)}</span>
            <span className="text-emerald-400 font-semibold">Risking.online</span>
          </div>
        </div>
      )}
    </button>
  );
}
