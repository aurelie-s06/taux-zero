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
- Comptes utilisateurs : inscription, connexion, sessions en cookie httpOnly, mots de passe hachés avec scrypt
- Base SQLite avec `node:sqlite` (intégré à Node 24, aucun paquet à installer)

## Lancer le projet

Node.js **24 ou plus** est nécessaire.

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
├── app/
│   ├── (app)/           pages réservées aux utilisateurs connectés (Ma soirée, Profil)
│   ├── (auth)/          connexion et inscription
│   └── actions/         Server Actions (compte, profil)
├── components/          barre de navigation, jauge, formulaires…
├── lib/
│   ├── alcool.ts        moteur de calcul (Widmark)
│   ├── compte.ts        validation de l'inscription
│   ├── profil.ts        validation du profil
│   └── server/          base de données, sessions, mots de passe (code serveur uniquement)
└── proxy.ts             renvoie vers la connexion sans cookie de session
```

La base est créée automatiquement au premier lancement dans `data/taux-zero.sqlite` (ignorée par git).
Pour repartir de zéro : arrêter le serveur et supprimer le dossier `data/`.
