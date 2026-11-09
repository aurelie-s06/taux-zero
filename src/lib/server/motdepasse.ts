import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

/**
 * Hachage des mots de passe avec scrypt (module crypto de Node).
 * Format stocké : scrypt$N$r$p$sel$empreinte (sel et empreinte en base64).
 */
const scrypt = promisify(scryptCb) as (
  motDePasse: string,
  sel: Buffer,
  longueur: number,
  options: { N: number; r: number; p: number },
) => Promise<Buffer>;

const N = 16384;
const R = 8;
const P = 1;
const LONGUEUR = 64;

export async function hacher(motDePasse: string): Promise<string> {
  const sel = randomBytes(16);
  const empreinte = await scrypt(motDePasse, sel, LONGUEUR, { N, r: R, p: P });
  return ["scrypt", N, R, P, sel.toString("base64"), empreinte.toString("base64")].join("$");
}

export async function verifier(motDePasse: string, stocke: string): Promise<boolean> {
  const [algo, n, r, p, sel, empreinte] = stocke.split("$");
  if (algo !== "scrypt" || !sel || !empreinte) return false;
  const attendu = Buffer.from(empreinte, "base64");
  const calcule = await scrypt(motDePasse, Buffer.from(sel, "base64"), attendu.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  // Comparaison en temps constant
  return calcule.length === attendu.length && timingSafeEqual(calcule, attendu);
}
