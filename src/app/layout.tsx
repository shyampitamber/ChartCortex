import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";
import "./globals.css";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChartCorex | Chart image intelligence",
  description:
    "Upload a chart screenshot and receive a complete trade structure with measured levels, entry, stop loss, targets and reasoning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${comfortaa.variable} bg-canvas text-ink antialiased`}>
        {children}
      </body>
    </html>
  );
}
