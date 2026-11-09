import { test } from "node:test";
import assert from "node:assert/strict";
import { hacher, verifier } from "./motdepasse.ts";

test("le hash ne contient pas le mot de passe en clair", async () => {
  const h = await hacher("mon-secret-123");
  assert.ok(h.startsWith("scrypt$"));
  assert.ok(!h.includes("mon-secret-123"));
});

test("deux hash du même mot de passe sont différents (sel aléatoire)", async () => {
  assert.notEqual(await hacher("abcdefgh"), await hacher("abcdefgh"));
});

test("vérification : bon et mauvais mot de passe", async () => {
  const h = await hacher("mon-secret-123");
  assert.equal(await verifier("mon-secret-123", h), true);
  assert.equal(await verifier("Mon-secret-123", h), false);
  assert.equal(await verifier("mon-secret-123", "n'importe quoi"), false);
});
