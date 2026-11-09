import type { Metadata } from "next";
import Link from "next/link";
import { FormulaireConnexion } from "@/components/FormulaireConnexion";

export const metadata: Metadata = { title: "Connexion" };

export default function Connexion() {
  return (
    <>
      <h1 className="auth__title">Bon retour</h1>
      <p className="auth__sub">Connecte-toi pour retrouver ton profil et ta soirée.</p>

      <FormulaireConnexion />

      <p className="auth__foot">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="il">
          Créer un compte
        </Link>
      </p>
    </>
  );
}
