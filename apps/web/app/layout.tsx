import type { Metadata } from "next";
import { JetBrains_Mono, Playfair_Display, Instrument_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/providers";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["italic"],
  weight: "600",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["300", "400", "500", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Trace",
    template: "%s | Trace",
  },
  description: "Evidence-first engineering hiring.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
          ${instrument.variable}
          ${inter.variable}
          ${mono.variable}
          ${playfair.variable}
          theme-moss
          bg-background text-foreground font-sans
          antialiased
        `}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}