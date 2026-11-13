"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

/** Erreur inattendue dans une page de l'application */
export default function Erreur({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page">
      <div className="empty">
        <div className="empty__mark">
          <RotateCcw size={22} aria-hidden="true" />
        </div>
        <h1>Un souci est survenu</h1>
        <p>La page n&apos;a pas pu s&apos;afficher. Tes données ne sont pas perdues : réessaie.</p>
        <button type="button" className="btn btn--primary" onClick={() => retry()}>
          Réessayer
        </button>
      </div>
    </div>
  );
}
