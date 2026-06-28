import { use } from "react";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Lobby } from "../../src/components/Lobby";

type PageParams = Promise<{ locale: string }>;

type Props = {
  params: PageParams;
};

export async function generateMetadata({ params }: { params: PageParams }) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "Metadata",
  });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function HomePage({ params }: Props) {
  const { locale } = use(params);

  setRequestLocale(locale);

  const t = useTranslations("HomePage");

  return (
    <main className="bg-neutral-100 min-h-screen text-neutral-800">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
        <div className="rounded-2xl bg-white p-6 shadow-md sm:p-10 mb-8">
          <header className="border-b border-neutral-200 pb-6 text-center">
            <h1 className="font-heading text-4xl font-extrabold text-neutral-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-emerald-700">
              {t("heading")}
            </h1>
            <p className="mt-2 text-neutral-500 font-medium">Versão Digital - MVP</p>
          </header>

          <Lobby />

          <footer className="mt-10 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
            {t("footer")}
          </footer>
        </div>
      </div>
    </main>
  );
}
