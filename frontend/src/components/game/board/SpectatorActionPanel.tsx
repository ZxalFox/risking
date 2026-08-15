import { useTranslations } from "next-intl";

interface SpectatorActionPanelProps {
  proposedMitigation?: string;
}

export function SpectatorActionPanel({
  proposedMitigation,
}: SpectatorActionPanelProps) {
  const t = useTranslations("Game");

  return (
    <section
      role="status"
      aria-live="polite"
      className="bg-neutral-900/60 p-6 rounded-2xl border border-neutral-700 flex flex-col items-center justify-center min-h-[140px] text-center w-full"
    >
      <div className="w-8 h-8 border-4 border-neutral-600 border-t-orange-500 rounded-full animate-spin mb-3"></div>
      <p className="text-neutral-400 font-medium text-sm md:text-base">
        {proposedMitigation
          ? t("attackerEvaluating")
          : t("waitingDefense")}
      </p>
    </section>
  );
}
