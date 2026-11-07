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
- Tailwind CSS

## Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).
