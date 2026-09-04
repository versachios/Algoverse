import type { Metadata } from "next";
import { Manrope, Newsreader, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted via next/font instead of a runtime <link> to
// fonts.googleapis.com — the old approach depended on that CDN being
// reachable on every visit, which is flaky on some VN networks / with
// ad-block or privacy extensions, and silently falls back to a system font
// that's missing Vietnamese diacritic glyphs (hence "ể" rendering as "ế").
// next/font downloads and bundles the font files at build time instead.
const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});
const newsreader = Newsreader({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Algoverse — Học thuật toán bằng trực quan hoá",
  description:
    "Website học thuật toán, cấu trúc dữ liệu và tin học từ cơ bản đến olympiad qua mô phỏng trực quan 2D/3D.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`h-full antialiased ${manrope.variable} ${newsreader.variable} ${plexMono.variable}`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
