import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CATALOGUE,
  depuisHeureSaisie,
  estCategorie,
  lireNombre,
  validerVerre,
  versHeureSaisie,
} from "./boissons.ts";
import { grammesAlcool } from "./alcool.ts";

const MIN = 60_000;
const H = 60 * MIN;
// 7 nov., 21h30 (heure locale)
const maintenant = new Date(2026, 10, 7, 21, 30).getTime();
const verre = { nom: "Pinte", volumeCl: 50, degre: 5, buLe: maintenant - H };

test("catalogue : identifiants uniques et verres plausibles (5 à 25 g d'alcool)", () => {
  const ids = new Set(CATALOGUE.map((b) => b.id));
  assert.equal(ids.size, CATALOGUE.length);
  for (const b of CATALOGUE) {
    const g = grammesAlcool(b);
    assert.ok(g >= 5 && g <= 25, `${b.nom} : ${g} g`);
    assert.ok(estCategorie(b.categorie));
  }
});

test("lireNombre accepte la virgule et refuse le vide", () => {
  assert.equal(lireNombre("12,5"), 12.5);
  assert.ok(Number.isNaN(lireNombre("")));
  assert.ok(Number.isNaN(lireNombre("abc")));
});

test("verre valide → aucune erreur", () => {
  assert.deepEqual(validerVerre(verre, maintenant), {});
});

test("verre : nom, volume et degré contrôlés", () => {
  const e = validerVerre({ ...verre, nom: " ", volumeCl: 0, degre: 95 }, maintenant);
  assert.ok(e.nom && e.volumeCl && e.degre);
});

test("verre : ni dans le futur, ni de plus de 24 h", () => {
  assert.ok(validerVerre({ ...verre, buLe: maintenant + H }, maintenant).buLe);
  assert.ok(validerVerre({ ...verre, buLe: maintenant - 25 * H }, maintenant).buLe);
  assert.equal(validerVerre({ ...verre, buLe: maintenant + 5 * MIN }, maintenant).buLe, undefined);
});

test("heure saisie : aujourd'hui si déjà passée", () => {
  const t = depuisHeureSaisie("20:00", maintenant);
  assert.equal(t, new Date(2026, 10, 7, 20, 0).getTime());
  assert.equal(versHeureSaisie(t), "20:00");
});

test("heure saisie : la veille si plus tard que maintenant", () => {
  const uneHeureDuMatin = new Date(2026, 10, 8, 1, 0).getTime();
  assert.equal(depuisHeureSaisie("23:00", uneHeureDuMatin), new Date(2026, 10, 7, 23, 0).getTime());
});

test("heure saisie invalide → NaN", () => {
  assert.ok(Number.isNaN(depuisHeureSaisie("", maintenant)));
  assert.ok(Number.isNaN(depuisHeureSaisie("25:00", maintenant)));
});
