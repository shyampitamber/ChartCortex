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
    <html lang="en" data-theme="dark">
      <body className={`${comfortaa.variable} bg-canvas text-ink antialiased`}>
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
