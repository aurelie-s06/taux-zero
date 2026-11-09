import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { Profil } from "@/lib/alcool";
import { db } from "./db";
import { lireSession } from "./session";

/**
 * Couche d'accès aux données : toutes les lectures passent par l'utilisateur
 * de la session, jamais par un identifiant venu du navigateur.
 */

export interface Utilisateur {
  id: number;
  email: string;
  prenom: string | null;
}

/** Utilisateur connecté (lu une seule fois par requête), ou null */
export const utilisateurCourant = cache(async (): Promise<Utilisateur | null> => {
  const id = await lireSession();
  if (id === null) return null;
  const u = db().prepare("SELECT id, email, prenom FROM utilisateurs WHERE id = ?").get(id) as
    | Utilisateur
    | undefined;
  return u ?? null;
});

/** Utilisateur connecté, sinon renvoi vers la page de connexion */
export async function exigerUtilisateur(): Promise<Utilisateur> {
  const u = await utilisateurCourant();
  if (!u) redirect("/connexion");
  return u;
}

// ---------- Profil ----------

interface LigneProfil {
  sexe: "homme" | "femme";
  poids_kg: number;
  jeune_permis: number;
  a_jeun: number;
}

/** Profil de l'utilisateur connecté, ou null s'il ne l'a pas encore rempli */
export async function lireMonProfil(): Promise<Profil | null> {
  const u = await exigerUtilisateur();
  const p = db()
    .prepare("SELECT sexe, poids_kg, jeune_permis, a_jeun FROM profils WHERE utilisateur_id = ?")
    .get(u.id) as LigneProfil | undefined;
  if (!p) return null;
  return {
    sexe: p.sexe,
    poidsKg: p.poids_kg,
    jeunePermis: p.jeune_permis === 1,
    aJeun: p.a_jeun === 1,
  };
}

export function enregistrerProfil(utilisateurId: number, p: Profil) {
  db().prepare(
    `INSERT INTO profils (utilisateur_id, sexe, poids_kg, jeune_permis, a_jeun, modifie_le)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (utilisateur_id) DO UPDATE SET
       sexe = excluded.sexe,
       poids_kg = excluded.poids_kg,
       jeune_permis = excluded.jeune_permis,
       a_jeun = excluded.a_jeun,
       modifie_le = excluded.modifie_le`,
  ).run(utilisateurId, p.sexe, p.poidsKg, p.jeunePermis ? 1 : 0, p.aJeun ? 1 : 0, Date.now());
}

// ---------- Comptes ----------

export function trouverParEmail(email: string) {
  return db()
    .prepare("SELECT id, mot_de_passe FROM utilisateurs WHERE email = ?")
    .get(email) as { id: number; mot_de_passe: string } | undefined;
}

export function creerUtilisateur(email: string, prenom: string | null, hash: string): number {
  const r = db()
    .prepare("INSERT INTO utilisateurs (email, prenom, mot_de_passe, cree_le) VALUES (?, ?, ?, ?)")
    .run(email, prenom, hash, Date.now());
  return Number(r.lastInsertRowid);
}

/** Supprime le compte et, en cascade, ses sessions et son profil */
export function supprimerUtilisateur(id: number) {
  db().prepare("DELETE FROM utilisateurs WHERE id = ?").run(id);
}
