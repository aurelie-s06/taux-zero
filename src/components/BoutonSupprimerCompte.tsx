"use client";

import { supprimerMonCompte } from "@/app/actions/compte";

/** Supprime le compte et toutes ses données, après confirmation */
export function BoutonSupprimerCompte() {
  return (
    <form
      action={supprimerMonCompte}
      onSubmit={(e) => {
        if (!window.confirm("Supprimer ton compte et ton profil ? Cette action est définitive.")) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="btn btn--ghost" style={{ paddingLeft: 0 }}>
        Supprimer mon compte
      </button>
    </form>
  );
}
