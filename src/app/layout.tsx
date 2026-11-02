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
  title: "ChartCortex | Chart image intelligence",
  description:
    "Upload a chart screenshot and receive a complete trade structure with measured levels, entry, stop loss, targets and reasoning.",
  openGraph: {
    title: "ChartCortex | Chart image intelligence",
    description:
      "Upload a chart screenshot and receive a complete trade structure with measured levels, entry, stop loss, targets and reasoning.",
    url: "https://ChartCortex.vercel.app",
    siteName: "ChartCortex",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChartCortex | Chart image intelligence",
    description:
      "Upload a chart screenshot and receive a complete trade structure with measured levels, entry, stop loss, targets and reasoning.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
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
