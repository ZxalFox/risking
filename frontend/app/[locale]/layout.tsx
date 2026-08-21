import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { GameProvider } from "@/context/GameContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-inter",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-fredoka",
});

type Props = {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isPt = locale === "pt-BR";

  const title = isPt
    ? "Risking.online - O Jogo Multiplayer de Gestão de Riscos em Software"
    : "Risking.online - Multiplayer Software Risk Management Card Game";

  const description = isPt
    ? "Desafie seus amigos no Risking.online! Ataque com riscos de software, descreva mitigações em tempo real e teste suas habilidades estratégicas neste jogo de cartas educativo."
    : "Challenge your friends on Risking.online! Attack with software risks, formulate real-time strategic mitigations, and test your skills in this educational multiplayer card game.";

  const siteUrl = "https://risking.online";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: "%s | Risking.online",
    },
    description,
    keywords: [
      "Risking",
      "Risking.online",
      "jogo de cartas",
      "gerenciamento de riscos",
      "engenharia de software",
      "mitigações de software",
      "card game online",
      "multiplayer risk game",
      "software engineering game",
    ],
    authors: [{ name: "Risking.online" }],
    creator: "Risking.online",
    publisher: "Risking.online",
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        "pt-BR": `${siteUrl}/pt-BR`,
        "en": `${siteUrl}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}`,
      siteName: "Risking.online",
      locale: isPt ? "pt_BR" : "en_US",
      type: "website",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: isPt
            ? "Risking.online - Jogo Multiplayer de Gestão de Riscos"
            : "Risking.online - Multiplayer Software Risk Management Card Game",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fredoka.variable} font-body bg-neutral-100 text-neutral-800`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex min-h-dvh flex-col">
            <GameProvider>
              <header className="w-full flex justify-end p-4 bg-neutral-900">
                <LocaleSwitcher />
              </header>
              <div className="flex-1 flex flex-col">{children}</div>
            </GameProvider>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
