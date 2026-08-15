import { useTranslations } from "next-intl";
import { Player } from "../../../types/game.types";

interface AttackBannerProps {
  attackerPlayer?: Player;
  targetPlayer?: Player;
}

export function AttackBanner({
  attackerPlayer,
  targetPlayer,
}: AttackBannerProps) {
  const t = useTranslations("Game");

  return (
    <section
      role="alert"
      aria-live="polite"
      className="bg-red-500/20 border border-red-500 text-red-200 px-6 py-4 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.3)] flex flex-col justify-center"
    >
      <h2 className="text-xl md:text-2xl font-bold mb-1">
        {t("attackInProgress")}
      </h2>
      <p className="text-sm md:text-base">
        <strong className="text-white font-semibold">
          {attackerPlayer?.nickname || "..."}
        </strong>{" "}
        {t("isAttacking")}{" "}
        <strong className="text-white font-semibold">
          {targetPlayer?.nickname || "..."}
        </strong>
      </p>
    </section>
  );
}
