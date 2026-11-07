export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <header className="mb-10 text-center">
        <p className="text-5xl">🥂</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Taux <span className="text-accent">Zéro</span>
        </h1>
        <p className="mt-2 text-muted">
          Estime ton alcoolémie heure par heure et sache quand tu peux reprendre
          le volant.
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-6 text-center text-muted">
        L&apos;application arrive bientôt…
      </section>
    </main>
  );
}
