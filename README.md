# 🥂 Taux Zéro

Application Next.js qui estime le **taux d'alcool dans le sang** au fil de la soirée.

L'utilisateur saisit ses verres (ex. : une coupe de champagne à 20h). L'application calcule :

- son alcoolémie estimée heure par heure ;
- l'heure à laquelle il peut **reprendre le volant** (0,5 g/L, ou 0,2 g/L en permis probatoire) ;
- l'heure à laquelle il revient à **0 g/L**.

> ⚠️ Les résultats sont **des estimations** (formule de Widmark). Ils ne remplacent pas un éthylotest. Dans le doute, ne prends pas le volant.

## Stack

- [Next.js](https://nextjs.org) (App Router) + React
- TypeScript
- CSS classique (même système visuel que mon projet Mon Budget), thème clair / sombre
- Icônes [Lucide](https://lucide.dev)
- Données enregistrées dans le navigateur (localStorage), aucun compte nécessaire

## Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

```bash
npm test        # tests du moteur de calcul et du profil
npm run build   # vérifie que le projet compile
```

## Organisation

```
src/
├── app/                 pages (Ma soirée, Profil) et styles
├── components/          barre de navigation, jauge, formulaires…
├── hooks/               useProfil, useEstMonte
└── lib/
    ├── alcool.ts        moteur de calcul (Widmark)
    ├── profil.ts        validation du profil
    └── stockage.ts      sauvegarde dans le navigateur
```
