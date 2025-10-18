import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: no type declarations for CSS side-effect import
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // Regular, Medium, Bold
  variable: "--font-inter",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "Risking - The Game",
  description: "A game for teaching risk management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fredoka.variable}`}>
        {children}
      </body>
    </html>
  );
}
