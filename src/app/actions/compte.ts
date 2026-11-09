"use server";

import { redirect } from "next/navigation";
import { normaliserEmail, validerInscription, type Erreurs } from "@/lib/compte";
import {
  creerUtilisateur,
  exigerUtilisateur,
  supprimerUtilisateur,
  trouverParEmail,
} from "@/lib/server/donnees";
import { hacher, verifier } from "@/lib/server/motdepasse";
import { fermerSession, ouvrirSession } from "@/lib/server/session";

export interface EtatFormulaire {
  erreurs?: Erreurs;
  message?: string;
  /** Champs renvoyés pour ne pas vider le formulaire (jamais le mot de passe) */
  valeurs?: Record<string, string>;
}

const texte = (f: FormData, nom: string) => String(f.get(nom) ?? "");

// Empreinte factice : la connexion prend le même temps, que l'email existe ou non
const EMPREINTE_FACTICE = hacher("mot-de-passe-factice");

export async function inscription(_: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  const prenom = texte(f, "prenom").trim();
  const email = normaliserEmail(texte(f, "email"));
  const motDePasse = texte(f, "motDePasse");
  const confirmation = texte(f, "confirmation");
  const valeurs = { prenom, email };

  const erreurs = validerInscription({ prenom, email, motDePasse, confirmation });
  if (Object.keys(erreurs).length > 0) return { erreurs, valeurs };

  if (trouverParEmail(email)) {
    return {
      erreurs: { email: "Un compte existe déjà avec cette adresse. Connecte-toi plutôt." },
      valeurs,
    };
  }

  const id = creerUtilisateur(email, prenom || null, await hacher(motDePasse));
  await ouvrirSession(id);
  // Nouveau compte : direction le questionnaire
  redirect("/profil");
}

export async function connexion(_: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  const email = normaliserEmail(texte(f, "email"));
  const motDePasse = texte(f, "motDePasse");

  const utilisateur = trouverParEmail(email);
  const ok = await verifier(
    motDePasse,
    utilisateur?.mot_de_passe ?? (await EMPREINTE_FACTICE),
  );

  if (!utilisateur || !ok) {
    return {
      message: "Adresse email ou mot de passe incorrect.",
      valeurs: { email },
    };
  }

  await ouvrirSession(utilisateur.id);
  redirect("/");
}

export async function deconnexion() {
  await fermerSession();
  redirect("/connexion");
}

export async function supprimerMonCompte() {
  const u = await exigerUtilisateur();
  supprimerUtilisateur(u.id);
  await fermerSession();
  redirect("/inscription");
}
