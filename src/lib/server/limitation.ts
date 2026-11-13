import "server-only";
import { headers } from "next/headers";
import { db } from "./db";

/**
 * Limitation des essais : au-delà de `max` essais dans la fenêtre,
 * on refuse sans même vérifier le mot de passe.
 */
export interface Regle {
  max: number;
  fenetreMs: number;
}

const MINUTE = 60_000;
export const REGLES = {
  connexionParEmail: { max: 5, fenetreMs: 15 * MINUTE },
  connexionParIp: { max: 20, fenetreMs: 15 * MINUTE },
  inscriptionParIp: { max: 10, fenetreMs: 60 * MINUTE },
} satisfies Record<string, Regle>;

/** Minutes à attendre si la limite est atteinte, sinon 0 */
export function attenteMinutes(cle: string, regle: Regle): number {
  const depuis = Date.now() - regle.fenetreMs;
  const lignes = db()
    .prepare("SELECT le FROM tentatives WHERE cle = ? AND le > ? ORDER BY le")
    .all(cle, depuis) as { le: number }[];
  if (lignes.length < regle.max) return 0;
  // La plus ancienne tentative de la fenêtre libère une place quand elle expire
  const libre = lignes[lignes.length - regle.max].le + regle.fenetreMs;
  return Math.max(1, Math.ceil((libre - Date.now()) / MINUTE));
}

export function noterTentative(...cles: string[]) {
  const maintenant = Date.now();
  const inserer = db().prepare("INSERT INTO tentatives (cle, le) VALUES (?, ?)");
  for (const cle of cles) inserer.run(cle, maintenant);
  // Ménage : rien ne sert de garder plus d'une heure
  db()
    .prepare("DELETE FROM tentatives WHERE le < ?")
    .run(maintenant - 60 * MINUTE);
}

export function effacerTentatives(cle: string) {
  db().prepare("DELETE FROM tentatives WHERE cle = ?").run(cle);
}

/** Adresse IP du visiteur (transmise par l'hébergeur dans X-Forwarded-For) */
export async function adresseIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "inconnue";
}
