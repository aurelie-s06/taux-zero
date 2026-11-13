"use client";

import { useActionState } from "react";
import Link from "next/link";
import { inscription } from "@/app/actions/compte";
import { ChampMotDePasse } from "@/components/ChampMotDePasse";
import { ErreurChamp, propsChamp } from "@/components/ErreurChamp";
import { MDP_MIN, PRENOM_MAX } from "@/lib/compte";

export function FormulaireInscription() {
  const [etat, action, enCours] = useActionState(inscription, {});
  const e = etat.erreurs ?? {};

  return (
    <form action={action} className="auth__form" noValidate>
      <p className="field__hint">Les champs marqués d&apos;un astérisque (*) sont obligatoires.</p>

      {etat.message && (
        <p className="b-alert" role="alert">
          {etat.message}
        </p>
      )}

      <div className="field">
        <label className="field__label" htmlFor="prenom">
          Prénom <span className="b-item__meta">(facultatif, {PRENOM_MAX} caractères max.)</span>
        </label>
        <input
          id="prenom"
          name="prenom"
          className="field__input"
          autoComplete="given-name"
          maxLength={PRENOM_MAX}
          defaultValue={etat.valeurs?.prenom}
          {...propsChamp("prenom-erreur", e.prenom)}
        />
        <ErreurChamp id="prenom-erreur" message={e.prenom} />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="email">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="field__input"
          autoComplete="email"
          placeholder="prenom@exemple.fr"
          required
          defaultValue={etat.valeurs?.email}
          {...propsChamp("email-erreur", e.email)}
        />
        <ErreurChamp id="email-erreur" message={e.email} />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="motDePasse">
          Mot de passe
        </label>
        <ChampMotDePasse
          id="motDePasse"
          name="motDePasse"
          autoComplete="new-password"
          required
          aide={`Au moins ${MDP_MIN} caractères. Une phrase facile à retenir fait un bon mot de passe.`}
          afficherSolidite
          erreur={e.motDePasse}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="confirmation">
          Confirmation du mot de passe
        </label>
        <ChampMotDePasse
          id="confirmation"
          name="confirmation"
          autoComplete="new-password"
          required
          erreur={e.confirmation}
        />
      </div>

      <div className="field">
        <label className="b-check">
          <input
            type="checkbox"
            name="consentement"
            value="oui"
            required
            defaultChecked={etat.valeurs?.consentement === "oui"}
            {...propsChamp("consentement-erreur", e.consentement)}
          />
          <span>
            J&apos;accepte que mon profil et mes verres soient enregistrés pour calculer mon taux,
            comme décrit dans la{" "}
            <Link href="/confidentialite" className="il" target="_blank">
              politique de confidentialité
            </Link>
            .
          </span>
        </label>
        <ErreurChamp id="consentement-erreur" message={e.consentement} />
      </div>

      <button
        type="submit"
        className="btn btn--primary btn--block"
        disabled={enCours}
        style={{ marginTop: 4 }}
      >
        {enCours ? "Création…" : "Créer mon compte"}
      </button>
    </form>
  );
}
