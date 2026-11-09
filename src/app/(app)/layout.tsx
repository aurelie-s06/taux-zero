import { Suspense } from "react";
import { ActionsCompte } from "@/components/ActionsCompte";
import { Footer } from "@/components/Footer";
import { MainNav } from "@/components/MainNav";
import { SkipLinks } from "@/components/SkipLinks";

/** Pages de l'application : réservées aux utilisateurs connectés */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SkipLinks />
      <MainNav
        compte={
          // Lit la session : chargé à part, sans bloquer le reste de la page
          <Suspense fallback={<span className="iconbtn" aria-hidden="true" />}>
            <ActionsCompte />
          </Suspense>
        }
      />
      <main id="contenu" tabIndex={-1} className="app-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
