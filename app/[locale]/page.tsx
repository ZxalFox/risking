import { use } from "react";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

const FIGMA_URL =
  "https://www.figma.com/design/ygawE00FCv1V6EVPB07XWx/risking?node-id=0-1&t=Pz7NEPyBNpfMBnW2-1";

const NEXT_STEPS_KEYS = [
  "architecture",
  "design",
  "prototype",
  "stack",
] as const;

const ARTIFACT_KEYS = ["designSystem"] as const;

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
    <main className="bg-neutral-100 text-neutral-800">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
        <div className="rounded-2xl bg-white p-6 shadow-md sm:p-10">
          <header className="border-b border-neutral-200 pb-6">
            <h1 className="font-heading text-3xl text-neutral-900 sm:text-4xl">
              {t("heading")}
            </h1>
          </header>

          <div className="space-y-10 pt-6 font-body text-base leading-relaxed sm:text-lg">
            <section id="description" className="space-y-4">
              <h2 className="border-b border-neutral-200 pb-2 font-heading text-2xl text-neutral-900">
                {t("descriptionHeading")}
              </h2>
              <p>{t("descriptionBody")}</p>
            </section>

            <section id="status" className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <h2 className="border-b border-neutral-200 pb-2 font-heading text-2xl text-neutral-900">
                  {t("statusHeading")}
                </h2>
                <span className="rounded-full bg-amber-500 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-white">
                  {t("statusTag")}
                </span>
              </div>
              <p>{t("statusBody")}</p>
            </section>

            <section id="next-steps" className="space-y-4">
              <h2 className="border-b border-neutral-200 pb-2 font-heading text-2xl text-neutral-900">
                {t("nextStepsHeading")}
              </h2>
              <p>{t("nextStepsIntro")}</p>
              <ul className="list-disc space-y-2 pl-6">
                {NEXT_STEPS_KEYS.map((key) => (
                  <li key={key}>{t(`nextStepsItems.${key}`)}</li>
                ))}
              </ul>
            </section>

            <section id="artifacts" className="space-y-4">
              <h2 className="border-b border-neutral-200 pb-2 font-heading text-2xl text-neutral-900">
                {t("artifactsHeading")}
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                {ARTIFACT_KEYS.map((key) => (
                  <li key={key}>
                    <a
                      href={FIGMA_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-600 underline transition hover:text-amber-700"
                    >
                      {t(`artifactsItems.${key}`)}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <footer className="mt-10 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
            {t("footer")}
          </footer>
        </div>
      </div>
    </main>
  );
}
