import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { MainNav } from "@/components/MainNav";
import { SkipLinks } from "@/components/SkipLinks";
import { CLE_THEME } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Taux Zéro",
    template: "%s · Taux Zéro",
  },
  description:
    "Taux Zéro : estime ton taux d'alcool dans le sang heure par heure et sache quand tu peux reprendre le volant.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111114" },
  ],
};

// Thème posé avant le premier affichage : pas de flash blanc en mode sombre.
// Choix enregistré, sinon celui du système.
const scriptTheme = `try{var t=localStorage.getItem("${CLE_THEME}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTheme }} />
      </head>
      <body>
        <SkipLinks />
        <MainNav />
        <main id="contenu" tabIndex={-1} className="app-main">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
