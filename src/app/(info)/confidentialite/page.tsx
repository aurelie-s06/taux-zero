import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Confidentialité et informations légales" };

export default function Confidentialite() {
  return (
    <div className="page b-prose-page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Confidentialité et informations légales</h1>
          <p className="page__description">
            Ce que Taux Zéro enregistre, pourquoi, combien de temps, et comment l&apos;effacer.
          </p>
        </div>
      </header>

      <article className="panel b-prose">
        <section className="section">
          <h2 className="section__title">En bref</h2>
          <ul>
            <li>Tes données servent uniquement à calculer ton taux d&apos;alcool estimé.</li>
            <li>Elles ne sont ni vendues, ni partagées, ni utilisées pour de la publicité.</li>
            <li>Aucun outil de mesure d&apos;audience, aucun traceur publicitaire.</li>
            <li>Tes verres sont effacés automatiquement après 48 heures.</li>
            <li>Tu peux supprimer ton compte et toutes tes données à tout moment.</li>
          </ul>
        </section>

        <section className="section">
          <h2 className="section__title">Responsable</h2>
          <p>
            Taux Zéro est un projet personnel réalisé par {SITE.responsable}. Pour toute question ou
            demande sur tes données, ouvre un ticket sur le{" "}
            <a href={SITE.depot} className="il" target="_blank" rel="noreferrer">
              dépôt GitHub du projet
            </a>
            .
          </p>
        </section>

        <section className="section">
          <h2 className="section__title">Données enregistrées</h2>
          <dl className="b-figures b-figures--texte">
            <div>
              <dt>Compte</dt>
              <dd>
                Adresse email, prénom (facultatif), mot de passe haché avec scrypt : il n&apos;est
                jamais stocké en clair.
              </dd>
            </div>
            <div>
              <dt>Profil</dt>
              <dd>Sexe, poids, type de permis, à jeun ou non.</dd>
            </div>
            <div>
              <dt>Verres</dt>
              <dd>Boisson, volume, degré et heure de chaque verre.</dd>
            </div>
            <div>
              <dt>Sécurité</dt>
              <dd>
                Essais de connexion échoués (adresse email et adresse IP), pour bloquer les
                tentatives en boucle.
              </dd>
            </div>
          </dl>
          <p>
            La consommation d&apos;alcool peut révéler des informations sur la santé. Ces données ne
            sont donc traitées qu&apos;avec ton <strong>consentement</strong>, donné à la création
            du compte. Tu peux le retirer à tout moment en supprimant ton compte.
          </p>
        </section>

        <section className="section">
          <h2 className="section__title">Durée de conservation</h2>
          <dl className="b-figures">
            <div>
              <dt>Verres</dt>
              <dd>48 heures</dd>
            </div>
            <div>
              <dt>Essais de connexion</dt>
              <dd>1 heure</dd>
            </div>
            <div>
              <dt>Session (rester connecté)</dt>
              <dd>30 jours</dd>
            </div>
            <div>
              <dt>Compte et profil</dt>
              <dd>Jusqu&apos;à la suppression du compte</dd>
            </div>
          </dl>
        </section>

        <section className="section">
          <h2 className="section__title">Cookies</h2>
          <p>
            Un seul cookie, <code>tz_session</code>, garde ta connexion ouverte. Il est
            indispensable au fonctionnement du compte : aucun bandeau n&apos;est donc nécessaire. Le
            thème clair ou sombre choisi est gardé dans ton navigateur et n&apos;est jamais envoyé
            au serveur.
          </p>
        </section>

        <section className="section">
          <h2 className="section__title">Tes droits</h2>
          <p>
            Tu peux consulter et modifier ton profil à tout moment depuis la page{" "}
            <Link href="/profil" className="il">
              Mon profil
            </Link>
            , et y supprimer ton compte : toutes tes données sont alors effacées immédiatement. Tu
            peux aussi adresser une réclamation à la{" "}
            <a href="https://www.cnil.fr" className="il" target="_blank" rel="noreferrer">
              CNIL
            </a>
            .
          </p>
        </section>

        <section className="section">
          <h2 className="section__title">Une estimation, pas une mesure</h2>
          <p>
            Les taux affichés sont calculés avec la formule de Widmark et restent des estimations :
            fatigue, médicaments ou métabolisme changent le résultat. Ils ne remplacent pas un
            éthylotest. Dans le doute, ne prends pas le volant.
          </p>
        </section>

        <section className="section">
          <h2 className="section__title">Hébergement</h2>
          <p>
            {SITE.hebergeur.nom}
            {SITE.hebergeur.adresse && <> · {SITE.hebergeur.adresse}</>}
          </p>
        </section>
      </article>
    </div>
  );
}
