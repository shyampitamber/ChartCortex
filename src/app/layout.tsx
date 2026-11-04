import type { Metadata } from "next";
import { Chivo, Comfortaa } from "next/font/google";
import "./globals.css";

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa",
  display: "swap",
});

const chivo = Chivo({
  subsets: ["latin"],
  variable: "--font-chivo",
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ChartCortex.vercel.app"),
  title: "ChartCortex | Live chart intelligence",
  description:
    "Select an asset and timeframe. ChartCortex analyses the live chart and returns the entry, stop, three targets and the reasoning, in under a minute.",
  openGraph: {
    title: "ChartCortex | Live chart intelligence",
    description:
      "Select an asset and timeframe. ChartCortex analyses the live chart and returns the entry, stop, three targets and the reasoning, in under a minute.",
    url: "https://ChartCortex.vercel.app",
    siteName: "ChartCortex",
    images: [
      {
        url: "/og-square.png",
        width: 1200,
        height: 1200,
        alt: "ChartCortex app icon",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ChartCortex | Live chart intelligence",
    description:
      "Select an asset and timeframe. ChartCortex analyses the live chart and returns the entry, stop, three targets and the reasoning, in under a minute.",
    images: ["/og-square.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body
        className={`${comfortaa.variable} ${chivo.variable} bg-canvas text-ink antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('cc-theme')==='light'){document.documentElement.setAttribute('data-theme','light')}}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
