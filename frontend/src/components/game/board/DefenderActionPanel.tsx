import { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { MdSend, MdEdit, MdShield } from "react-icons/md";

interface DefenderActionPanelProps {
  proposedMitigation?: string;
  isDescribing: boolean;
  mitigationText: string;
  onMitigationTextChange: (text: string) => void;
  onStartDescription: () => void;
  onCancelDescription: () => void;
  onSubmitDescription: (e: React.FormEvent) => void;
  onFailDefend: () => void;
}

export function DefenderActionPanel({
  proposedMitigation,
  isDescribing,
  mitigationText,
  onMitigationTextChange,
  onStartDescription,
  onCancelDescription,
  onSubmitDescription,
  onFailDefend,
}: DefenderActionPanelProps) {
  const t = useTranslations("Game");

  return (
    <section
      role="region"
      aria-label={t("defendQuestion")}
      className="flex flex-col items-center md:items-start gap-4 bg-neutral-950/90 p-5 md:p-6 rounded-2xl border-2 border-risk-primary shadow-[0_0_30px_rgba(205,84,0,0.4)] animate-in fade-in slide-in-from-bottom-4 backdrop-blur-md w-full"
    >
      {!proposedMitigation ? (
        <>
          <h3 className="text-lg md:text-xl font-bold text-white">
            {t("defendQuestion")}
          </h3>
          <p className="text-neutral-300 text-xs md:text-sm">
            {t.rich("defendInstructions", {
              bold: (chunks: ReactNode) => <strong>{chunks}</strong>,
            })}
          </p>

          {!isDescribing ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <button
                type="button"
                onClick={onStartDescription}
                aria-label={t("describeMitigation")}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none flex items-center justify-center gap-2"
              >
                <MdEdit size={18} aria-hidden="true" />
                {t("describeMitigation")}
              </button>
              <button
                type="button"
                onClick={onFailDefend}
                aria-label={t("acceptPenalty")}
                className="bg-neutral-900 hover:bg-red-900/50 text-red-400 hover:text-red-300 border border-neutral-700 hover:border-red-500/50 px-4 py-3 rounded-xl font-bold transition-all text-sm focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none flex items-center justify-center gap-2"
              >
                {t("acceptPenalty")}
              </button>
            </div>
          ) : (
            <form
              onSubmit={onSubmitDescription}
              className="w-full flex flex-col gap-3 mt-1"
            >
              <label
                htmlFor="mitigation-input"
                className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5"
              >
                <MdShield size={16} aria-hidden="true" />
                {t("describeMitigationTitle")}
              </label>
              <textarea
                id="mitigation-input"
                rows={3}
                value={mitigationText}
                onChange={(e) => onMitigationTextChange(e.target.value)}
                placeholder={t("describeMitigationPlaceholder")}
                className="w-full bg-neutral-900/90 border border-neutral-700 focus:border-emerald-500 rounded-xl p-3 text-white placeholder-neutral-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none transition-all"
                autoFocus
                required
              />
              <div className="flex gap-2 justify-end w-full">
                <button
                  type="button"
                  onClick={onCancelDescription}
                  aria-label={t("cancel")}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-4 py-2 rounded-xl text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={!mitigationText.trim()}
                  aria-label={t("sendMitigation")}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2 rounded-xl text-sm transition-all flex items-center gap-1.5 shadow-md shadow-emerald-900/30 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                >
                  <MdSend size={16} aria-hidden="true" />
                  {t("sendMitigation")}
                </button>
              </div>
            </form>
          )}
        </>
      ) : (
        <div
          role="status"
          aria-live="polite"
          className="w-full flex flex-col gap-3"
        >
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-neutral-800 pb-2">
            <MdShield size={18} aria-hidden="true" />
            <span>{t("proposedMitigationTitle")}</span>
          </div>
          <div className="bg-neutral-900/90 border border-emerald-500/30 rounded-xl p-3.5 text-neutral-200 text-sm italic">
            &quot;{proposedMitigation}&quot;
          </div>
          <div className="flex items-center justify-center gap-3 pt-2 text-neutral-400 text-xs sm:text-sm">
            <div className="w-4 h-4 border-2 border-neutral-600 border-t-emerald-500 rounded-full animate-spin"></div>
            <span>{t("waitingAttackerEvaluation")}</span>
          </div>
        </div>
      )}
    </section>
  );
}
