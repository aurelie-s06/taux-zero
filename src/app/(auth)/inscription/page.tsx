import type { Metadata } from "next";
import Link from "next/link";
import { FormulaireInscription } from "@/components/FormulaireInscription";

export const metadata: Metadata = { title: "Créer un compte" };

export default function Inscription() {
  return (
    <>
      <h1 className="auth__title">Crée ton compte</h1>
      <p className="auth__sub">
        Ton profil sera gardé : tu ne rempliras le questionnaire qu&apos;une seule fois.
      </p>

      <FormulaireInscription />

      <p className="auth__foot">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="il">
          Se connecter
        </Link>
      </p>
    </>
  );
}
