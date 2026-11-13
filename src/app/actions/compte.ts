"use server";

import { redirect } from "next/navigation";
import { normaliserEmail, validerInscription, type Erreurs } from "@/lib/compte";
import {
  creerUtilisateur,
  exigerUtilisateur,
  supprimerUtilisateur,
  trouverParEmail,
} from "@/lib/server/donnees";
import {
  adresseIp,
  attenteMinutes,
  effacerTentatives,
  noterTentative,
  REGLES,
} from "@/lib/server/limitation";
import { hacher, verifier } from "@/lib/server/motdepasse";
import { fermerSession, ouvrirSession } from "@/lib/server/session";

export interface EtatFormulaire {
  erreurs?: Erreurs;
  message?: string;
  /** Champs renvoyés pour ne pas vider le formulaire (jamais le mot de passe) */
  valeurs?: Record<string, string>;
}

const texte = (f: FormData, nom: string) => String(f.get(nom) ?? "");

const tropDEssais = (minutes: number) =>
  `Trop de tentatives. Réessaie dans ${minutes} minute${minutes > 1 ? "s" : ""}.`;

// Empreinte factice : la connexion prend le même temps, que l'email existe ou non
const EMPREINTE_FACTICE = hacher("mot-de-passe-factice");

export async function inscription(_: EtatFormulaire, f: FormData): Promise<EtatFormulaire> {
  const prenom = texte(f, "prenom").trim();
  const email = normaliserEmail(texte(f, "email"));
  const motDePasse = texte(f, "motDePasse");
  const confirmation = texte(f, "confirmation");
  const consentement = f.get("consentement") === "oui";
  const valeurs = { prenom, email, consentement: consentement ? "oui" : "" };

  const cleIp = `inscription:ip:${await adresseIp()}`;
  const attente = attenteMinutes(cleIp, REGLES.inscriptionParIp);
  if (attente > 0) return { message: tropDEssais(attente), valeurs };

  const erreurs = validerInscription({ prenom, email, motDePasse, confirmation, consentement });
  if (Object.keys(erreurs).length > 0) return { erreurs, valeurs };

  noterTentative(cleIp);
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

  // Trop d'échecs récents pour ce compte ou cette adresse IP : refus sans vérifier
  const cleEmail = `connexion:email:${email}`;
  const cleIp = `connexion:ip:${await adresseIp()}`;
  const attente = Math.max(
    attenteMinutes(cleEmail, REGLES.connexionParEmail),
    attenteMinutes(cleIp, REGLES.connexionParIp),
  );
  if (attente > 0) return { message: tropDEssais(attente), valeurs: { email } };

  const utilisateur = trouverParEmail(email);
  const ok = await verifier(motDePasse, utilisateur?.mot_de_passe ?? (await EMPREINTE_FACTICE));

  if (!utilisateur || !ok) {
    noterTentative(cleEmail, cleIp);
    return {
      message: "Adresse email ou mot de passe incorrect.",
      valeurs: { email },
    };
  }

  effacerTentatives(cleEmail);
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
