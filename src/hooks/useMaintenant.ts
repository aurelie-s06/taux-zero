import { useSyncExternalStore } from "react";

/**
 * Heure actuelle, mise à jour toutes les 30 secondes : le taux affiché suit le temps.
 * Renvoie null pendant le rendu serveur (l'heure est celle du navigateur).
 */
const INTERVALLE_MS = 30_000;

let maintenant = 0;
let minuterie: ReturnType<typeof setInterval> | undefined;
const ecouteurs = new Set<() => void>();

function prevenir() {
  maintenant = Date.now();
  ecouteurs.forEach((f) => f());
}

function abonner(f: () => void) {
  ecouteurs.add(f);
  if (!minuterie) {
    maintenant = Date.now();
    minuterie = setInterval(prevenir, INTERVALLE_MS);
  }
  return () => {
    ecouteurs.delete(f);
    if (ecouteurs.size === 0) {
      clearInterval(minuterie);
      minuterie = undefined;
    }
  };
}

function lire() {
  if (maintenant === 0) maintenant = Date.now();
  return maintenant;
}

export function useMaintenant(): number | null {
  return useSyncExternalStore(abonner, lire, () => null);
}
