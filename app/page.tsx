import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Risking - Project Status",
  description:
    "Acompanhe o progresso da adaptação digital do jogo Risking e veja os próximos passos do projeto.",
};

export default function Home() {
  return (
    <main className="bg-neutral-100 text-neutral-800">
      <div className="mx-auto max-w-3xl px-5 py-10 sm:py-16">
        <div className="rounded-2xl bg-white p-6 shadow-md sm:p-10">
          <header className="border-b border-neutral-200 pb-6">
            <h1 className="font-heading text-3xl text-neutral-900 sm:text-4xl">
              Risking: The Game
            </h1>
          </header>

          <div className="space-y-10 pt-6 text-base leading-relaxed font-body sm:text-lg">
            <section id="description" className="space-y-4">
              <h2 className="border-b border-neutral-200 pb-2 font-heading text-2xl text-neutral-900">
                Project Description
              </h2>
              <p>
                Risking is a non-digital card game designed to teach risk
                management in software projects. In the game, players take on
                the role of project managers, using cards to simulate the
                emergence of risks (attacks) and the application of solutions to
                mitigate them (defenses). Each round presents a challenge of
                strategy and knowledge, where players must identify the best way
                to handle the problems that arise.
              </p>
            </section>

            <section id="status" className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <h2 className="border-b border-neutral-200 pb-2 font-heading text-2xl text-neutral-900">
                  Current Status
                </h2>
                <span className="rounded-full bg-amber-500 px-4 py-1 text-sm font-semibold uppercase tracking-wide text-white">
                  In Development
                </span>
              </div>
              <p>
                The project is currently in the initial phase of digital
                adaptation. We have analyzed the original paper that proposed
                the game and are now structuring the foundational elements for
                the software version.
              </p>
            </section>

            <section id="next-steps" className="space-y-4">
              <h2 className="border-b border-neutral-200 pb-2 font-heading text-2xl text-neutral-900">
                Next Steps
              </h2>
              <p>Our immediate focus is on the following tasks:</p>
              <ul className="list-disc space-y-2 pl-6">
                <li>Plan the software architecture to be used.</li>
                <li>
                  Develop the design system and the user interface (UI/UX)
                  concepts.
                </li>
                <li>
                  Create a playable prototype with the core game mechanics.
                </li>
                <li>Define the technology stack for development.</li>
              </ul>
            </section>

            <section id="artifacts" className="space-y-4">
              <h2 className="border-b border-neutral-200 pb-2 font-heading text-2xl text-neutral-900">
                Generated Artifacts
              </h2>
              <ul className="list-disc space-y-2 pl-6">
                <li>
                  <Link
                    href="https://www.figma.com/design/ygawE00FCv1V6EVPB07XWx/risking?node-id=0-1&t=Pz7NEPyBNpfMBnW2-1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-600 underline hover:text-amber-700"
                  >
                    Design System (FIGMA)
                  </Link>
                </li>
              </ul>
            </section>
          </div>

          <footer className="mt-10 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
            Risking - Digital Version Project
          </footer>
        </div>
      </div>
    </main>
  );
}
