"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Profil } from "@/lib/alcool";
import { erreurPoids, estProfil, lirePoids } from "@/lib/profil";
import { enregistrerProfil, exigerUtilisateur, lireMonProfil } from "@/lib/server/donnees";
import type { EtatFormulaire } from "./compte";

export async function enregistrerMonProfil(
  _: EtatFormulaire,
  f: FormData,
): Promise<EtatFormulaire> {
  // L'action vérifie elle-même la session : on ne fait jamais confiance au navigateur
  const u = await exigerUtilisateur();
  const premiereFois = (await lireMonProfil()) === null;

  const poidsSaisi = String(f.get("poids") ?? "");
  const profil: Profil = {
    sexe: f.get("sexe") === "homme" ? "homme" : "femme",
    poidsKg: lirePoids(poidsSaisi),
    jeunePermis: f.get("jeunePermis") === "true",
    aJeun: f.get("aJeun") === "true",
  };

  const erreur = erreurPoids(profil.poidsKg);
  if (erreur || !estProfil(profil)) {
    return { erreurs: { poids: erreur ?? "Profil incomplet." }, valeurs: { poids: poidsSaisi } };
  }

  enregistrerProfil(u.id, profil);
  revalidatePath("/");

  // Premier remplissage : on montre tout de suite le résultat
  if (premiereFois) redirect("/");
  return { message: "Profil enregistré." };
}
