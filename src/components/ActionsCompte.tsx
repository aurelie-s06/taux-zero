import Link from "next/link";
import { LogOut } from "lucide-react";
import { deconnexion } from "@/app/actions/compte";
import { initiales } from "@/lib/compte";
import { utilisateurCourant } from "@/lib/server/donnees";

/** Avatar (lien vers le profil) et bouton de déconnexion, dans la barre du haut */
export async function ActionsCompte() {
  const u = await utilisateurCourant();
  if (!u) return null;

  return (
    <>
      <Link href="/profil" className="iconbtn b-avatar" title={`Mon profil (${u.email})`}>
        <span aria-hidden="true">{initiales(u.prenom, u.email)}</span>
        <span className="sr-only">Mon profil</span>
      </Link>
      <form action={deconnexion}>
        <button type="submit" className="iconbtn" aria-label="Déconnexion" title="Déconnexion">
          <LogOut size={16} aria-hidden="true" />
        </button>
      </form>
    </>
  );
}
