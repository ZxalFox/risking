"use client";

import { ChangeEvent, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const localeOptions = routing.locales;
type OptionLocale = (typeof localeOptions)[number];
const LOCALE_LABELS = {
  en: "en",
  "pt-BR": "pt-BR",
} as const satisfies Record<OptionLocale, string>;

export default function LocaleSwitcher() {
  const locale = useLocale() as OptionLocale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("LocaleSwitcher");
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as OptionLocale;

    if (nextLocale === locale) return;

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <label className="inline-flex items-center gap-2 text-xs md:text-sm font-body text-neutral-400">
      <span className="font-semibold hidden sm:inline">{t("label")}</span>
      <span className="relative inline-flex items-center">
        <select
          className="rounded-lg border border-neutral-700 bg-neutral-800/80 backdrop-blur-sm px-3 py-2 sm:px-2 sm:py-1 text-sm sm:text-xs font-medium text-neutral-300 shadow-sm transition hover:border-neutral-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/50 disabled:opacity-70 cursor-pointer"
          value={locale}
          onChange={handleChange}
          disabled={isPending}
          aria-label={t("label")}
        >
          {localeOptions.map((option) => {
            const translationKey = LOCALE_LABELS[option];
            return (
              <option key={option} value={option}>
                {t(translationKey)}
              </option>
            );
          })}
        </select>
        {/* <span className="pointer-events-none absolute right-3 h-2 w-2 rotate-45 border-b border-r border-neutral-500" /> */}
      </span>
    </label>
  );
}
