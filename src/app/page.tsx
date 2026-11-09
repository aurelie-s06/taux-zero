import { DemoCalcul } from "@/components/DemoCalcul";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-16">
      {/* Barre du haut */}
      <nav className="flex items-center justify-between py-6">
        <span className="font-display text-lg font-bold">
          Taux <span className="texte-neon">Zéro</span>
        </span>
        <span className="hidden rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted sm:inline">
          Estimation · formule de Widmark
        </span>
      </nav>

      {/* Accroche */}
      <header className="py-10 md:py-16">
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-muted">🍸 Ce soir, je bois</p>
        <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-7xl">
          Quand pourrai-je
          <br />
          reprendre <span className="texte-neon">le volant&nbsp;?</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          Note tes verres au fil de la soirée : Taux Zéro estime ton alcoolémie
          minute par minute et t&apos;indique l&apos;heure à laquelle tu repasses
          sous la limite.
        </p>
      </header>

      <DemoCalcul />

      <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted">
        ⚠️ Résultats indicatifs, qui ne remplacent pas un éthylotest. Dans le doute,
        ne prends pas le volant.
      </footer>
    </main>
  );
}
