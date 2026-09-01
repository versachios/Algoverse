import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Algoverse — Học thuật toán bằng trực quan hoá",
  description:
    "Website học thuật toán, cấu trúc dữ liệu và tin học từ cơ bản đến olympiad qua mô phỏng trực quan 2D/3D.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Newsreader:ital,wght@0,400;1,400;1,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
