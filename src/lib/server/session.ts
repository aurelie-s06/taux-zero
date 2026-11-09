import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { io } from "next/cache";
import { cookies } from "next/headers";
import { db } from "./db";

/**
 * Sessions : un jeton aléatoire dans un cookie httpOnly.
 * La base ne garde que son empreinte SHA-256 : une fuite de la base
 * ne permet pas de se connecter à la place de quelqu'un.
 */
const COOKIE = "tz_session"; // même nom dans src/proxy.ts
const DUREE_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

const empreinte = (jeton: string) => createHash("sha256").update(jeton).digest("hex");

export async function ouvrirSession(utilisateurId: number) {
  const jeton = randomBytes(32).toString("base64url");
  const expire = Date.now() + DUREE_MS;

  // Ménage des sessions expirées
  db().prepare("DELETE FROM sessions WHERE expire_le < ?").run(Date.now());
  db().prepare("INSERT INTO sessions (id, utilisateur_id, expire_le) VALUES (?, ?, ?)").run(
    empreinte(jeton),
    utilisateurId,
    expire,
  );

  (await cookies()).set(COOKIE, jeton, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expire),
  });
}

/** Identifiant de l'utilisateur connecté, ou null */
export async function lireSession(): Promise<number | null> {
  const jeton = (await cookies()).get(COOKIE)?.value;
  if (!jeton) return null;
  // Lecture synchrone (node:sqlite) et heure actuelle : à faire au moment de la requête,
  // jamais pendant le pré-rendu (voir la doc de Next sur io())
  await io();
  const ligne = db()
    .prepare("SELECT utilisateur_id FROM sessions WHERE id = ? AND expire_le > ?")
    .get(empreinte(jeton), Date.now()) as { utilisateur_id: number } | undefined;
  return ligne?.utilisateur_id ?? null;
}

export async function fermerSession() {
  const magasin = await cookies();
  const jeton = magasin.get(COOKIE)?.value;
  if (jeton) db().prepare("DELETE FROM sessions WHERE id = ?").run(empreinte(jeton));
  magasin.delete(COOKIE);
}

