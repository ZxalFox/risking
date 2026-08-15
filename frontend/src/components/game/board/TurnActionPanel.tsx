import { useTranslations } from "next-intl";

interface TurnActionPanelProps {
  selectedRisk: string | null;
  selectedTarget: string | null;
  onAttack: () => void;
}

export function TurnActionPanel({
  selectedRisk,
  selectedTarget,
  onAttack,
}: TurnActionPanelProps) {
  const t = useTranslations("Game");
  const canAttack = Boolean(selectedRisk && selectedTarget);

  return (
    <section
      role="region"
      aria-label={t("yourTurn")}
      className="text-center text-neutral-300 bg-neutral-900/50 p-6 rounded-2xl border border-risk-dark/50 shadow-inner"
    >
      <h2 className="text-2xl font-bold text-white mb-4">
        {t("yourTurn")}
      </h2>
      <ol className="flex flex-col gap-2 text-lg mb-6 list-none p-0">
        <li className="flex items-center justify-center gap-2">
          <span
            className="bg-risk-primary text-white w-6 h-6 rounded-full text-sm flex items-center justify-center font-bold"
            aria-hidden="true"
          >
            1
          </span>
          <span>{t("stepSelectRisk")}</span>
        </li>
        <li className="flex items-center justify-center gap-2">
          <span
            className="bg-risk-primary text-white w-6 h-6 rounded-full text-sm flex items-center justify-center font-bold"
            aria-hidden="true"
          >
            2
          </span>
          <span>{t("stepSelectTarget")}</span>
        </li>
      </ol>
      <button
        type="button"
        onClick={onAttack}
        disabled={!canAttack}
        aria-label={t("confirmAttack")}
        className="bg-risk-primary hover:bg-orange-500 disabled:bg-neutral-800 text-white px-10 py-4 rounded-xl font-extrabold text-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_15px_rgba(205,84,0,0.5)] disabled:shadow-none disabled:text-neutral-500 disabled:transform-none border border-transparent disabled:border-neutral-700 focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none"
      >
        {t("confirmAttack")}
      </button>
    </section>
  );
}
