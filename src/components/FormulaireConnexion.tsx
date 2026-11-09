"use client";

import { useActionState } from "react";
import { connexion } from "@/app/actions/compte";
import { ChampMotDePasse } from "@/components/ChampMotDePasse";

export function FormulaireConnexion() {
  const [etat, action, enCours] = useActionState(connexion, {});

  return (
    <form action={action} className="auth__form" noValidate>
      <p className="field__hint">Les champs marqués d&apos;un astérisque (*) sont obligatoires.</p>

      {etat.message && (
        <p className="b-alert" role="alert">
          {etat.message}
        </p>
      )}

      <div className="field">
        <label className="field__label" htmlFor="email">
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="field__input"
          autoComplete="username"
          placeholder="prenom@exemple.fr"
          required
          defaultValue={etat.valeurs?.email}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="motDePasse">
          Mot de passe
        </label>
        <ChampMotDePasse
          id="motDePasse"
          name="motDePasse"
          autoComplete="current-password"
          required
          aide="Attention aux majuscules et aux minuscules."
        />
      </div>

      <button type="submit" className="btn btn--primary btn--block" disabled={enCours} style={{ marginTop: 4 }}>
        {enCours ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
