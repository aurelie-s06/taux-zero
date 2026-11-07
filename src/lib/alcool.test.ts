import { test } from "node:test";
import assert from "node:assert/strict";
import {
  analyser,
  grammesAlcool,
  limiteLegale,
  simuler,
  type Profil,
  type Verre,
} from "./alcool.ts";

const H = 3_600_000;
const VINGT_HEURES = new Date(2026, 0, 1, 20, 0).getTime();

const homme: Profil = { sexe: "homme", poidsKg: 75, jeunePermis: false, aJeun: true };
const femme: Profil = { ...homme, sexe: "femme", poidsKg: 60 };

const coupeChampagne = (heure: number, id = "c"): Verre => ({
  id,
  nom: "Coupe de champagne",
  volumeCl: 12,
  degre: 12,
  heure,
});

test("grammes d'alcool : 12 cl à 12° ≈ 11,5 g", () => {
  assert.ok(Math.abs(grammesAlcool({ volumeCl: 12, degre: 12 }) - 11.52) < 0.01);
});

test("limite légale : 0,5 g/L ou 0,2 g/L en permis probatoire", () => {
  assert.equal(limiteLegale({ jeunePermis: false }), 0.5);
  assert.equal(limiteLegale({ jeunePermis: true }), 0.2);
});

test("aucun verre → taux nul", () => {
  const a = analyser(homme, [], VINGT_HEURES);
  assert.equal(a.tauxActuel, 0);
  assert.equal(a.pic, null);
  assert.equal(a.heureSobre, null);
});

test("une coupe de champagne : pic entre 0,15 et 0,22 g/L", () => {
  const a = analyser(homme, [coupeChampagne(VINGT_HEURES)], VINGT_HEURES);
  assert.ok(a.pic && a.pic.taux > 0.15 && a.pic.taux < 0.22, `pic = ${a.pic?.taux}`);
  // Jamais au-dessus de 0,5 → pas d'attente pour conduire
  assert.equal(a.heureConduite, null);
  // Sobre en moins de 3 h
  assert.ok(a.heureSobre! - VINGT_HEURES < 3 * H);
});

test("à profil égal, une femme plus légère a un taux plus élevé", () => {
  const verres = [coupeChampagne(VINGT_HEURES)];
  const picH = analyser(homme, verres).pic!.taux;
  const picF = analyser(femme, verres).pic!.taux;
  assert.ok(picF > picH);
});

test("4 coupes en 1 h : on dépasse 0,5 g/L, la conduite est retardée", () => {
  const verres = [0, 0.33, 0.66, 1].map((h, i) =>
    coupeChampagne(VINGT_HEURES + h * H, String(i)),
  );
  const a = analyser(homme, verres, VINGT_HEURES);
  assert.ok(a.pic!.taux >= 0.5, `pic = ${a.pic!.taux}`);
  assert.ok(a.heureConduite! > VINGT_HEURES + H);
  assert.ok(a.heureSobre! > a.heureConduite!);
});

test("jeune permis : on attend plus longtemps qu'avec un permis classique", () => {
  const verres = [0, 0.5, 1].map((h, i) => coupeChampagne(VINGT_HEURES + h * H, String(i)));
  const classique = analyser(homme, verres);
  const probatoire = analyser({ ...homme, jeunePermis: true }, verres);
  assert.ok(probatoire.heureConduite! > (classique.heureConduite ?? VINGT_HEURES));
});

test("le taux ne descend jamais sous 0", () => {
  const points = simuler(homme, [coupeChampagne(VINGT_HEURES)]);
  assert.ok(points.every((p) => p.taux >= 0));
  assert.equal(points[points.length - 1].taux, 0);
});
