import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { utilisateurCourant } from "@/lib/server/donnees";

/** Connexion / inscription : formulaire à gauche, présentation à droite */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <ul className="b-skip">
        <li>
          <a href="#contenu">Aller au contenu</a>
        </li>
      </ul>
      <Suspense fallback={null}>
        <DejaConnecte />
      </Suspense>

      <div className="auth">
        <div className="auth__form-col">
          <header className="auth__form-top">
            <Logo href="/connexion" />
            <span className="auth__toggle-mobile">
              <ThemeToggle />
            </span>
          </header>
          <main id="contenu" tabIndex={-1} className="auth__form-wrap">
            {children}
          </main>
          <Footer compact />
        </div>

        <aside className="auth__aside">
          <div className="auth__aside-top">
            <ThemeToggle />
          </div>

          <div className="auth__aside-body">
            <span className="tag">Suivi d&apos;alcoolémie</span>
            <p className="auth__quote">
              Note tes verres, Taux Zéro te dit quand tu peux reprendre le volant.
            </p>
            <p className="pitch__p">
              Ton profil est enregistré dans ton compte : plus besoin de remplir le questionnaire
              à chaque soirée.
            </p>
          </div>

          <div aria-hidden="true" />
        </aside>
      </div>
    </>
  );
}

/** Déjà connecté : pas besoin de ces pages, retour à la soirée */
async function DejaConnecte() {
  if (await utilisateurCourant()) redirect("/");
  return null;
}
