import { test } from "node:test";
import assert from "node:assert/strict";
import { erreurPoids, estProfil, lirePoids } from "./profil.ts";

test("poids : accepte 30 à 250 kg", () => {
  assert.equal(erreurPoids(60), null);
  assert.equal(erreurPoids(30), null);
  assert.equal(erreurPoids(250), null);
});

test("poids : refuse vide, négatif ou hors limites", () => {
  assert.ok(erreurPoids(NaN));
  assert.ok(erreurPoids(0));
  assert.ok(erreurPoids(-5));
  assert.ok(erreurPoids(20));
  assert.ok(erreurPoids(400));
});

test("lirePoids accepte la virgule", () => {
  assert.equal(lirePoids("62,5"), 62.5);
  assert.equal(lirePoids(" 70 "), 70);
  assert.ok(Number.isNaN(lirePoids("abc")));
});

test("estProfil reconnaît un profil valide", () => {
  assert.ok(estProfil({ sexe: "femme", poidsKg: 60, jeunePermis: true, aJeun: false }));
});

test("estProfil rejette les données abîmées", () => {
  assert.equal(estProfil(null), false);
  assert.equal(estProfil("texte"), false);
  assert.equal(estProfil({ sexe: "autre", poidsKg: 60, jeunePermis: true, aJeun: false }), false);
  assert.equal(estProfil({ sexe: "homme", poidsKg: 5, jeunePermis: true, aJeun: false }), false);
  assert.equal(estProfil({ sexe: "homme", poidsKg: 70 }), false);
});
