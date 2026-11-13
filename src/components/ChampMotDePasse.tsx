"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ErreurChamp } from "@/components/ErreurChamp";

interface Props {
  id: string;
  name: string;
  autoComplete: "current-password" | "new-password";
  required?: boolean;
  erreur?: string;
  /** Texte d'aide relié au champ */
  aide?: string;
  /** Création d'un mot de passe : indique sa solidité */
  afficherSolidite?: boolean;
}

const NIVEAUX = ["trop court", "faible", "correct", "solide"] as const;

// La longueur compte plus que la variété des caractères
function solidite(mdp: string) {
  if (mdp.length < 8) return 0;
  const sortes = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/].filter((r) => r.test(mdp)).length;
  if (mdp.length >= 16 || (mdp.length >= 12 && sortes >= 3)) return 3;
  return mdp.length >= 12 || sortes >= 3 ? 2 : 1;
}

/** Champ de mot de passe avec un bouton pour afficher les caractères saisis */
export function ChampMotDePasse({
  id,
  name,
  autoComplete,
  required,
  erreur,
  aide,
  afficherSolidite,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [saisie, setSaisie] = useState("");
  const niveau = solidite(saisie);
  const champ = useRef<HTMLInputElement>(null);

  // Formulaire remis à zéro (après un envoi) : le champ est vidé, l'indicateur aussi
  useEffect(() => {
    const formulaire = champ.current?.form;
    if (!formulaire) return;
    const vider = () => setSaisie("");
    formulaire.addEventListener("reset", vider);
    return () => formulaire.removeEventListener("reset", vider);
  }, []);

  const decritPar = [
    aide && `${id}-aide`,
    afficherSolidite && saisie !== "" && `${id}-solidite`,
    erreur && `${id}-erreur`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {aide && (
        <p id={`${id}-aide`} className="field__hint">
          {aide}
        </p>
      )}
      <div className="b-password">
        <input
          ref={champ}
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          className="field__input"
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required={required}
          maxLength={128}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={decritPar || undefined}
          onChange={(e) => setSaisie(e.target.value)}
        />
        <button
          type="button"
          className="b-password__toggle"
          aria-controls={id}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
          {visible ? "Masquer" : "Afficher"}
          <span className="sr-only"> le mot de passe</span>
        </button>
      </div>
      {afficherSolidite && saisie !== "" && (
        <p id={`${id}-solidite`} className="b-strength" data-level={niveau} aria-live="polite">
          <span className="b-strength__bar" aria-hidden="true" />
          Solidité : {NIVEAUX[niveau]}
        </p>
      )}
      <ErreurChamp id={`${id}-erreur`} message={erreur} />
    </>
  );
}
