/**
 * Profil de l'utilisateur : validation et libellés.
 * (Fichier sans React, testable avec `npm test`.)
 */
import type { Profil } from "./alcool.ts";

export const POIDS_MIN = 30;
export const POIDS_MAX = 250;

/** Message d'erreur pour le poids, ou null s'il est correct */
export function erreurPoids(poids: number): string | null {
  if (!Number.isFinite(poids) || poids <= 0) return "Indique ton poids en kilos.";
  if (poids < POIDS_MIN || poids > POIDS_MAX) {
    return `Le poids doit être compris entre ${POIDS_MIN} et ${POIDS_MAX} kg.`;
  }
  return null;
}

/** Vérifie qu'une valeur lue dans le navigateur est bien un profil complet */
export function estProfil(valeur: unknown): valeur is Profil {
  if (typeof valeur !== "object" || valeur === null) return false;
  const p = valeur as Record<string, unknown>;
  return (
    (p.sexe === "homme" || p.sexe === "femme") &&
    typeof p.poidsKg === "number" &&
    erreurPoids(p.poidsKg) === null &&
    typeof p.jeunePermis === "boolean" &&
    typeof p.aJeun === "boolean"
  );
}

/** Lit un poids tapé par l'utilisateur (« 62,5 » ou « 62.5 ») */
export function lirePoids(saisie: string): number {
  return Number(saisie.trim().replace(",", "."));
}

export const libelles = {
  sexe: (p: Profil) => (p.sexe === "homme" ? "Homme" : "Femme"),
  poids: (p: Profil) => `${p.poidsKg.toString().replace(".", ",")} kg`,
  permis: (p: Profil) => (p.jeunePermis ? "Jeune permis" : "Permis classique"),
  repas: (p: Profil) => (p.aJeun ? "À jeun" : "A mangé"),
};
