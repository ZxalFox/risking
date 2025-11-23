import { use } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import BackendPlayground from "@/components/BackendPlayground";

type PageParams = Promise<{ locale: string }>;

type Props = {
  params: PageParams;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "PlaygroundMetadata",
  });

  return {
    title: t("title"),
    description: t("description"),
  } satisfies Metadata;
}

export default function PlaygroundPage({ params }: Props) {
  const { locale } = use(params);

  setRequestLocale(locale);

  return (
    <main className="bg-neutral-100 text-neutral-800">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:py-16">
        <BackendPlayground
          initialBaseUrl={process.env.NEXT_PUBLIC_API_BASE_URL}
          initialLocale={locale}
        />
      </div>
    </main>
  );
}
