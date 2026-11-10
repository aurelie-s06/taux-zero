import { Suspense } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { TableauSoiree } from "@/components/TableauSoiree";
import { lireMaSoiree, lireMonProfil } from "@/lib/server/donnees";

export default function MaSoiree() {
  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Ma soirée</h1>
          <p className="page__description">
            Note tes verres : ton taux d&apos;alcool est estimé en direct.
          </p>
        </div>
      </header>

      {/* Lit la session et le profil : affiché dès qu'ils sont prêts */}
      <Suspense fallback={<Squelettes />}>
        <Soiree />
      </Suspense>
    </div>
  );
}

async function Soiree() {
  const profil = await lireMonProfil();

  if (!profil) {
    return (
      <div className="empty">
        <div className="empty__mark">
          <UserRound size={22} aria-hidden="true" />
        </div>
        <h2 className="empty__title">Il manque ton profil</h2>
        <p>
          Ton poids, ton sexe et ton type de permis permettent d&apos;estimer ton taux
          d&apos;alcool. Tu ne le rempliras qu&apos;une fois : il est gardé dans ton compte.
        </p>
        <Link href="/profil" className="btn btn--primary">
          Remplir mon profil
        </Link>
      </div>
    );
  }

  const verres = await lireMaSoiree();
  return <TableauSoiree profil={profil} verres={verres} />;
}

function Squelettes() {
  return (
    <div className="b-soiree" aria-hidden="true">
      <div className="b-dash b-soiree__dash">
        <div className="b-skeleton b-span-6" />
        <div className="b-skeleton b-span-6" />
      </div>
      <div className="b-skeleton b-soiree__ajout" style={{ minHeight: 420 }} />
    </div>
  );
}
