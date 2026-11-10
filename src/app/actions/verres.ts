"use server";

import { revalidatePath } from "next/cache";
import { CATALOGUE, estCategorie, lireNombre, validerVerre, VERRES_MAX } from "@/lib/boissons";
import {
  ajouterVerre,
  compterVerresSoiree,
  exigerUtilisateur,
  supprimerVerre,
  viderVerres,
} from "@/lib/server/donnees";
import type { EtatFormulaire } from "./compte";

export async function ajouterUnVerre(_: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  const u = await exigerUtilisateur();

  const boisson = CATALOGUE.find((b) => b.id === f.get("boisson"));
  const categorieSaisie = f.get("categorie");
  const categorie = boisson?.categorie ?? (estCategorie(categorieSaisie) ? categorieSaisie : "autre");
  const saisie = {
    // Boisson du catalogue : on garde son nom ; sinon celui tapé par l'utilisateur
    nom: boisson?.nom ?? String(f.get("nom") ?? ""),
    volumeCl: lireNombre(String(f.get("volume") ?? "")),
    degre: lireNombre(String(f.get("degre") ?? "")),
    buLe: Number(f.get("buLe")),
  };

  const erreurs = validerVerre(saisie, Date.now());
  if (Object.keys(erreurs).length > 0) return { erreurs };

  if (compterVerresSoiree(u.id) >= VERRES_MAX) {
    return { message: `Une soirée compte au maximum ${VERRES_MAX} verres.` };
  }

  ajouterVerre(u.id, categorie, saisie);
  revalidatePath("/");
  return { message: `Verre ajouté : ${saisie.nom.trim()}.` };
}

export async function supprimerUnVerre(verreId: string) {
  const u = await exigerUtilisateur();
  const id = Number(verreId);
  if (Number.isInteger(id)) supprimerVerre(u.id, id);
  revalidatePath("/");
}

export async function viderMaSoiree() {
  const u = await exigerUtilisateur();
  viderVerres(u.id);
  revalidatePath("/");
}
