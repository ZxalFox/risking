import { useTranslations } from "next-intl";
import { MdCheck, MdClose, MdShield } from "react-icons/md";

interface AttackerActionPanelProps {
  proposedMitigation?: string;
  onEvaluateMitigation?: (approved: boolean) => void;
}

export function AttackerActionPanel({
  proposedMitigation,
  onEvaluateMitigation,
}: AttackerActionPanelProps) {
  const t = useTranslations("Game");

  return (
    <section
      role="region"
      aria-label={t("evaluatingDefenseTitle")}
      className="bg-neutral-950/90 p-5 md:p-6 rounded-2xl border-2 border-orange-500/60 shadow-[0_0_25px_rgba(205,84,0,0.3)] animate-in fade-in slide-in-from-bottom-4 backdrop-blur-md w-full"
    >
      {proposedMitigation ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-orange-400 font-bold text-sm sm:text-base border-b border-neutral-800 pb-2">
            <MdShield
              size={18}
              className="text-emerald-400"
              aria-hidden="true"
            />
            <h3>{t("evaluatingDefenseTitle")}</h3>
          </div>

          <p className="text-xs text-neutral-400">
            {t("proposedMitigationTitle")}
          </p>

          <blockquote
            tabIndex={0}
            className="bg-neutral-900 border border-neutral-700/80 rounded-xl p-4 text-emerald-300 font-medium text-sm md:text-base shadow-inner focus-visible:ring-1 focus-visible:ring-emerald-500/50 focus-visible:outline-none"
          >
            &quot;{proposedMitigation}&quot;
          </blockquote>

          <p className="text-xs text-neutral-400 italic">
            {t("evaluatingDefenseHint")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => onEvaluateMitigation?.(true)}
              aria-label={t("acceptDefense")}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none flex items-center justify-center gap-2"
            >
              <MdCheck size={20} aria-hidden="true" />
              {t("accept")}
            </button>
            <button
              type="button"
              onClick={() => onEvaluateMitigation?.(false)}
              aria-label={t("denyDefense")}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none flex items-center justify-center gap-2"
            >
              <MdClose size={20} aria-hidden="true" />
              {t("deny")}
            </button>
          </div>
        </div>
      ) : (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center justify-center min-h-[140px] text-center"
        >
          <div className="w-8 h-8 border-4 border-neutral-600 border-t-orange-500 rounded-full animate-spin mb-3"></div>
          <p className="text-neutral-400 font-medium text-sm md:text-base">
            {t("waitingDefense")}
          </p>
        </div>
      )}
    </section>
  );
}
