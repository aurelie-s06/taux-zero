"use client";

import { useSyncExternalStore } from "react";

const sAbonner = () => () => {};

/**
 * Renvoie `false` pendant le rendu serveur, `true` dans le navigateur.
 * Permet d'utiliser l'heure locale ou le localStorage sans erreur d'hydratation.
 */
export function useEstMonte(): boolean {
  return useSyncExternalStore(
    sAbonner,
    () => true,
    () => false,
  );
}
