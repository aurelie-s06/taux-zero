import { useSyncExternalStore } from "react";

/**
 * Petite valeur sauvegardée dans le navigateur (localStorage),
 * partagée entre les composants et les onglets ouverts.
 *
 * - `useValeur()` : hook React qui renvoie la valeur et se met à jour tout seul
 * - `ecrire(v)` / `effacer()` : modifient la valeur partout
 *
 * Si le stockage est indisponible (navigation privée…), la valeur par défaut est utilisée.
 */
export function creerStockage<T>(
  cle: string,
  defaut: T,
  valider: (v: unknown) => v is T,
) {
  const ecouteurs = new Set<() => void>();
  let brutEnCache: string | null | undefined;
  let valeurEnCache: T = defaut;

  function lire(): T {
    let brut: string | null = null;
    try {
      brut = localStorage.getItem(cle);
    } catch {
      /* stockage bloqué */
    }
    // On ne relit le JSON que s'il a changé : React exige la même référence
    if (brut !== brutEnCache) {
      brutEnCache = brut;
      try {
        const v: unknown = brut === null ? defaut : JSON.parse(brut);
        valeurEnCache = valider(v) ? v : defaut;
      } catch {
        valeurEnCache = defaut;
      }
    }
    return valeurEnCache;
  }

  function prevenir() {
    ecouteurs.forEach((f) => f());
  }

  function ecrire(valeur: T) {
    try {
      localStorage.setItem(cle, JSON.stringify(valeur));
    } catch {
      /* stockage bloqué */
    }
    prevenir();
  }

  function effacer() {
    try {
      localStorage.removeItem(cle);
    } catch {
      /* stockage bloqué */
    }
    prevenir();
  }

  function abonner(f: () => void) {
    ecouteurs.add(f);
    // Changement fait dans un autre onglet
    const surStorage = (e: StorageEvent) => {
      if (e.key === cle) f();
    };
    window.addEventListener("storage", surStorage);
    return () => {
      ecouteurs.delete(f);
      window.removeEventListener("storage", surStorage);
    };
  }

  function useValeur(): T {
    return useSyncExternalStore(abonner, lire, () => defaut);
  }

  return { useValeur, lire, ecrire, effacer };
}
