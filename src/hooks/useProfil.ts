import type { Profil } from "@/lib/alcool";
import { estProfil } from "@/lib/profil";
import { creerStockage } from "@/lib/stockage";

const estProfilOuVide = (v: unknown): v is Profil | null => v === null || estProfil(v);

/** Profil sauvegardé dans le navigateur (null tant qu'il n'a pas été rempli) */
export const profilStockage = creerStockage<Profil | null>(
  "taux-zero:profil",
  null,
  estProfilOuVide,
);

export const useProfil = profilStockage.useValeur;
