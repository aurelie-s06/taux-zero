import { test } from "node:test";
import assert from "node:assert/strict";
import { erreurEmail, initiales, normaliserEmail, validerInscription } from "./compte.ts";

const valide = { prenom: "Aurélie", email: "a@exemple.fr", motDePasse: "unephrasesolide", confirmation: "unephrasesolide", consentement: true };

test("email normalisé en minuscules, sans espaces", () => {
  assert.equal(normaliserEmail("  Aurelie@Exemple.FR "), "aurelie@exemple.fr");
});

test("email : refuse les adresses invalides", () => {
  assert.equal(erreurEmail("a@exemple.fr"), null);
  assert.ok(erreurEmail(""));
  assert.ok(erreurEmail("pas-un-email"));
  assert.ok(erreurEmail("a@b"));
});

test("inscription valide → aucune erreur", () => {
  assert.deepEqual(validerInscription(valide), {});
});

test("inscription : mot de passe trop court", () => {
  const e = validerInscription({ ...valide, motDePasse: "court", confirmation: "court" });
  assert.ok(e.motDePasse);
});

test("inscription : confirmation différente", () => {
  const e = validerInscription({ ...valide, confirmation: "autrechose123" });
  assert.ok(e.confirmation);
  assert.equal(e.motDePasse, undefined);
});

test("initiales : prénom composé, prénom simple ou email", () => {
  assert.equal(initiales("Jean-Pierre", "x@y.fr"), "JP");
  assert.equal(initiales("aurélie", "x@y.fr"), "A");
  assert.equal(initiales(null, "zoe@y.fr"), "Z");
});

test("inscription : consentement obligatoire", () => {
  const e = validerInscription({ ...valide, consentement: false });
  assert.ok(e.consentement);
});
