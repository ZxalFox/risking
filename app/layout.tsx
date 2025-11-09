// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Allow global CSS side-effect import
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
