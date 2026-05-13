import type { Metadata, Viewport } from "next";
import { DM_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { GlobalCanvas } from "@/components/canvas/GlobalCanvas";
import { MiaScene } from "@/components/canvas/MiaScene";
import { Navbar } from "@/components/Navbar";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "M2W — Marketing to Win | Digital Influencer IA",
  description:
    "Plataforma de influência digital e avatares gerados por IA. Persona Mia Park para TikTok Shop, Fanvue e automação comercial B2B. Resultados reais, 24/7.",
  keywords: [
    "influencer digital",
    "avatar IA",
    "TikTok Shop",
    "Fanvue",
    "marketing digital",
    "Mia Park",
    "M2W",
    "Marketing to Win",
  ],
  authors: [{ name: "M2W — Marketing to Win", url: "https://m2w.com.br" }],
  openGraph: {
    title: "M2W — Influência Digital. Resultados Reais.",
    description:
      "Avatar digital de IA que converte 24/7. TikTok Shop, Fanvue e automação B2B.",
    url: "https://m2w.com.br",
    siteName: "M2W Platform",
    locale: "pt_BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#050508",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} ${inter.variable} dark`}
      suppressHydrationWarning
    >
      <body className="bg-bg-deep text-text-primary font-sans antialiased">
        {/* WebGL background — fixed, behind all content */}
        <GlobalCanvas>
          <MiaScene />
        </GlobalCanvas>

        <Providers>
          <Navbar />
          {children}

          {/* Footer */}
          <footer className="border-t border-glass-border py-8 px-6">
            <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm">
                  <span className="text-text-primary">M2</span>
                  <span className="text-accent-glow">W</span>
                </span>
                <span className="text-text-muted text-xs">
                  — Marketing to Win
                </span>
              </div>
              <p className="text-xs text-text-muted">
                © {new Date().getFullYear()} M2W Platform. Todos os direitos reservados.
              </p>
              <p className="text-xs text-text-muted">
                Powered by{" "}
                <span className="text-accent-glow">ComfyUI</span> ×{" "}
                <span className="text-accent-glow">RTX 4070Ti</span>
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
