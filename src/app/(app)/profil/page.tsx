import { Suspense } from "react";
import type { Metadata } from "next";
import { BoutonSupprimerCompte } from "@/components/BoutonSupprimerCompte";
import { FormulaireProfil } from "@/components/FormulaireProfil";
import { LIMITES } from "@/lib/alcool";
import { exigerUtilisateur, lireMonProfil } from "@/lib/server/donnees";

export const metadata: Metadata = { title: "Mon profil" };

const virgule = (n: number) => n.toString().replace(".", ",");

export default function MonProfil() {
  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Mon profil</h1>
          <p className="page__description">
            Ces informations servent à estimer ton taux d&apos;alcool. Elles sont enregistrées
            dans ton compte.
          </p>
        </div>
      </header>

      <div className="b-split">
        <div className="b-stack">
          <Suspense fallback={<div className="b-skeleton" style={{ minHeight: 480 }} />}>
            <Formulaire />
          </Suspense>
        </div>

        <aside className="panel">
          <div className="section">
            <h2 className="section__title">Comment est fait le calcul ?</h2>
            <p className="section__description">
              Avec la formule de Widmark : la quantité d&apos;alcool bue, divisée par ton poids
              multiplié par un coefficient (0,7 pour un homme, 0,6 pour une femme). Le foie
              élimine ensuite environ 0,10 à 0,15 g/L par heure ; l&apos;application retient la
              valeur la plus prudente.
            </p>
          </div>
          <div className="section">
            <h2 className="section__title">Limites en France</h2>
            <dl className="b-figures" style={{ marginTop: 10 }}>
              <div>
                <dt>Permis classique</dt>
                <dd>{virgule(LIMITES.standard)} g/L</dd>
              </div>
              <div>
                <dt>Jeune permis</dt>
                <dd>{virgule(LIMITES.probatoire)} g/L</dd>
              </div>
            </dl>
          </div>
          <div className="section">
            <h2 className="section__title">Une estimation</h2>
            <p className="section__description">
              Fatigue, médicaments ou métabolisme changent le résultat. Seul un éthylotest mesure
              ton taux réel.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

async function Formulaire() {
  const utilisateur = await exigerUtilisateur();
  const profil = await lireMonProfil();

  return (
    <>
      <section className="panel" aria-labelledby="titre-questionnaire">
        <h2 id="titre-questionnaire" className="section__title">
          {profil ? "Questionnaire" : `Bienvenue${utilisateur.prenom ? ` ${utilisateur.prenom}` : ""} !`}
        </h2>
        <p className="section__description" style={{ marginBottom: 20 }}>
          {profil
            ? "Modifie tes réponses si ta situation change."
            : "Réponds une seule fois à ces quatre questions : elles seront gardées dans ton compte."}
        </p>
        <FormulaireProfil initial={profil} />
      </section>

      <section className="panel" aria-labelledby="titre-compte">
        <h2 id="titre-compte" className="section__title">
          Mon compte
        </h2>
        <dl className="b-figures" style={{ marginTop: 10 }}>
          <div>
            <dt>Adresse email</dt>
            <dd>{utilisateur.email}</dd>
          </div>
          {utilisateur.prenom && (
            <div>
              <dt>Prénom</dt>
              <dd>{utilisateur.prenom}</dd>
            </div>
          )}
        </dl>
        <div style={{ marginTop: 16 }}>
          <BoutonSupprimerCompte />
        </div>
      </section>
    </>
  );
}
