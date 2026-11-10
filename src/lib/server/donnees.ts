import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { Profil, Verre } from "@/lib/alcool";
import { FENETRE_SOIREE_MS, type Categorie, type SaisieVerre } from "@/lib/boissons";
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

// ---------- Verres ----------

interface LigneVerre {
  id: number;
  nom: string;
  categorie: string;
  volume_cl: number;
  degre: number;
  bu_le: number;
}

/** Verres de la soirée en cours (dernières 24 h), du plus ancien au plus récent */
export async function lireMaSoiree(): Promise<Verre[]> {
  const u = await exigerUtilisateur();
  const lignes = db()
    .prepare(
      `SELECT id, nom, categorie, volume_cl, degre, bu_le FROM verres
       WHERE utilisateur_id = ? AND bu_le > ?
       ORDER BY bu_le, id`,
    )
    .all(u.id, Date.now() - FENETRE_SOIREE_MS) as unknown as LigneVerre[];
  return lignes.map((v) => ({
    id: String(v.id),
    nom: v.nom,
    categorie: v.categorie,
    volumeCl: v.volume_cl,
    degre: v.degre,
    heure: v.bu_le,
  }));
}

export function compterVerresSoiree(utilisateurId: number): number {
  const r = db()
    .prepare("SELECT COUNT(*) AS n FROM verres WHERE utilisateur_id = ? AND bu_le > ?")
    .get(utilisateurId, Date.now() - FENETRE_SOIREE_MS) as { n: number };
  return r.n;
}

export function ajouterVerre(utilisateurId: number, categorie: Categorie, v: SaisieVerre) {
  db()
    .prepare(
      `INSERT INTO verres (utilisateur_id, nom, categorie, volume_cl, degre, bu_le, cree_le)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(utilisateurId, v.nom.trim(), categorie, v.volumeCl, v.degre, v.buLe, Date.now());
}

/** Supprime un verre, seulement s'il appartient bien à cet utilisateur */
export function supprimerVerre(utilisateurId: number, verreId: number) {
  db().prepare("DELETE FROM verres WHERE id = ? AND utilisateur_id = ?").run(verreId, utilisateurId);
}

export function viderVerres(utilisateurId: number) {
  db().prepare("DELETE FROM verres WHERE utilisateur_id = ?").run(utilisateurId);
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
