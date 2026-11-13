# 🥂 Taux Zéro

[![CI](https://github.com/aurelie-s06/taux-zero/actions/workflows/ci.yml/badge.svg)](https://github.com/aurelie-s06/taux-zero/actions/workflows/ci.yml)

**Taux Zéro** estime ton taux d'alcool dans le sang au fil de la soirée et te dit à quelle heure tu
peux reprendre le volant.

Tu notes tes verres (« une coupe de champagne à 20h »), l'application calcule en direct :

- ton **taux d'alcool estimé**, minute par minute ;
- l'heure à laquelle tu peux **reprendre le volant** : sous 0,5 g/L, ou sous 0,2 g/L en permis probatoire ;
- l'heure à laquelle tu reviens à **0 g/L** ;
- la **courbe** de ton taux sur toute la soirée.

> ⚠️ **Les résultats sont des estimations.** Fatigue, médicaments ou métabolisme changent le taux
> réel. Taux Zéro ne remplace pas un éthylotest : dans le doute, ne prends pas le volant.

![Page « Ma soirée » : jauge du taux actuel, heure de reprise du volant, courbe de la soirée et liste des verres](docs/capture-soiree.png)

## Sommaire

- [Utilisation](#utilisation)
- [Fonctionnalités](#fonctionnalités)
- [Comment est fait le calcul](#comment-est-fait-le-calcul)
- [Stack technique](#stack-technique)
- [Lancer le projet](#lancer-le-projet)
- [Organisation du code](#organisation-du-code)
- [Sécurité et données personnelles](#sécurité-et-données-personnelles)
- [Intégration continue](#intégration-continue)
- [Mise en ligne](#mise-en-ligne)
- [Étapes du projet](#étapes-du-projet)

## Utilisation

1. **Crée un compte** avec ton adresse email et un mot de passe.
2. **Réponds une seule fois au questionnaire** : sexe, poids, type de permis, à jeun ou non.
   Il est gardé dans ton compte, et modifiable à tout moment.
3. **Ajoute tes verres** au fil de la soirée : une boisson du catalogue (ou la tienne) et l'heure à
   laquelle tu l'as bue.
4. **Suis ton taux** : la jauge, l'heure de reprise du volant et la courbe se mettent à jour toutes
   les 30 secondes.
5. Le lendemain, **« Nouvelle soirée »** remet tout à zéro.

## Fonctionnalités

| | |
|---|---|
| **Compte** | Inscription avec consentement explicite, connexion, déconnexion, suppression du compte et de toutes ses données |
| **Profil** | Questionnaire rempli une seule fois, modifiable |
| **Verres** | Catalogue de 13 boissons (champagne, vins, bières, cidre, cocktails, spiritueux) ou boisson personnalisée ; volume et degré modifiables ; suppression d'un verre |
| **Résultats** | Jauge du taux actuel, pic de la soirée, heure de reprise du volant avec le temps restant, retour à 0 g/L |
| **Courbe** | Partie au-dessus de la limite en rouge, repère « maintenant », un point par verre ; lecture au survol, au toucher ou au clavier ; données chiffrées en tableau |
| **Interface** | Thème clair et sombre, pensée d'abord pour le téléphone, installable sur l'écran d'accueil |
| **Accessibilité** | Liens d'accès rapide, erreurs reliées aux champs, graphique utilisable au clavier et au lecteur d'écran |

## Comment est fait le calcul

Le moteur ([`src/lib/alcool.ts`](src/lib/alcool.ts)) applique la **formule de Widmark** :

```
taux (g/L) = grammes d'alcool ÷ (poids en kg × coefficient de diffusion)
grammes d'alcool = volume (ml) × degré ÷ 100 × 0,8
```

- **Coefficient de diffusion** : 0,7 pour un homme, 0,6 pour une femme.
- **Absorption progressive** : chaque verre passe dans le sang en 30 minutes à jeun, en 1 heure
  pendant un repas.
- **Élimination** : le foie élimine de 0,10 à 0,15 g/L par heure. L'application retient
  **0,10 g/L**, la valeur la plus prudente pour la conduite.
- Le taux est **simulé minute par minute** du premier verre jusqu'au retour à 0 g/L.
- **Limites légales en France** : 0,5 g/L, et 0,2 g/L pour un permis probatoire.

Exemple : une coupe de champagne (12 cl à 12°) contient environ 11,5 g d'alcool.

## Stack technique

- [Next.js 16](https://nextjs.org) (App Router, Server Actions, Cache Components) et React 19
- TypeScript
- CSS classique, sans framework (même système visuel que mon projet Mon Budget)
- Base **SQLite** avec `node:sqlite`, intégré à Node 24 : aucun paquet de base de données
- Graphique dessiné en **SVG**, sans bibliothèque
- Icônes [Lucide](https://lucide.dev)
- Tests avec le lanceur intégré à Node (`node --test`)
- Docker et GitHub Actions

## Lancer le projet

Il faut **Node.js 24 ou plus**.

```bash
git clone https://github.com/aurelie-s06/taux-zero.git
cd taux-zero
npm install
npm run dev
```

Ouvre ensuite [http://localhost:3000](http://localhost:3000) et crée un compte.

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm test` | Tests : moteur de calcul, boissons, profil, comptes, mots de passe |
| `npm run lint` | Vérification du code |
| `npm run build` | Build de production |
| `npm start` | Lance le build de production |

La base est créée automatiquement au premier lancement dans `data/taux-zero.sqlite`, qui n'est pas
envoyé sur GitHub. Pour repartir de zéro, arrête le serveur et supprime le dossier `data/`.

## Organisation du code

```
src/
├── app/
│   ├── (app)/             pages réservées aux utilisateurs connectés (Ma soirée, Profil)
│   ├── (auth)/            connexion et inscription
│   ├── (info)/            confidentialité, lisible sans compte
│   ├── actions/           Server Actions : compte, profil, verres
│   └── manifest.ts        application installable
├── components/            barre de navigation, jauge, courbe, formulaires…
├── hooks/                 useMaintenant (horloge partagée, rafraîchie toutes les 30 s)
├── lib/
│   ├── alcool.ts          moteur de calcul (Widmark)
│   ├── boissons.ts        catalogue des boissons, validation d'un verre
│   ├── compte.ts          validation de l'inscription
│   ├── profil.ts          validation du profil
│   ├── site.ts            informations légales (hébergeur)
│   └── server/            base de données, sessions, mots de passe, limitation des essais
└── proxy.ts               renvoie vers la connexion sans cookie de session
```

Le code de [`src/lib/server/`](src/lib/server/) ne s'exécute que sur le serveur : toutes les lectures
passent par l'utilisateur de la session, jamais par un identifiant envoyé par le navigateur.

## Sécurité et données personnelles

- **Mots de passe** hachés avec scrypt, jamais stockés en clair.
- **Sessions** : jeton aléatoire dans un cookie `httpOnly` ; la base n'en garde que l'empreinte SHA-256.
- **Limitation des essais** : 5 échecs de connexion par compte et 20 par adresse IP sur 15 minutes,
  10 inscriptions par heure et par adresse IP.
- **Contrôle d'accès** : chaque page et chaque action vérifie la session côté serveur ; un
  utilisateur ne peut lire ni modifier que ses propres données.
- **En-têtes de sécurité** : interdiction des iframes, `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- **Minimisation** : les verres sont effacés après 48 h, les essais de connexion après 1 h.
- **Consentement** : la consommation d'alcool peut révéler des informations de santé ; elle n'est
  enregistrée qu'avec l'accord explicite donné à l'inscription.
- Une page **[Confidentialité](src/app/(info)/confidentialite/page.tsx)** détaille les données, les
  durées de conservation, l'unique cookie et les droits de l'utilisateur.

## Intégration continue

Le workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) se lance à chaque `git push` et
pull request :

1. **lint, tests et build** sous Node 24 ;
2. sur `main`, si tout passe : **construction de l'image Docker** et publication sur le registre de
   GitHub, `ghcr.io/aurelie-s06/taux-zero` (étiquettes `latest` et `sha-xxxxxxx`).

Les résultats sont dans l'onglet **Actions** du dépôt. Le badge en haut de cette page est vert quand
tout passe.

## Mise en ligne

SQLite enregistre les données dans un **fichier** : il faut un hébergeur qui garde un disque entre
deux redémarrages (Railway, Render avec un disque, Fly.io, un VPS…). Vercel ne convient pas tel
quel. Le [`Dockerfile`](Dockerfile) fonctionne chez tous ces hébergeurs ; la base y est rangée dans
`/data`, où monter un volume persistant.

### Lancer l'image publiée sur GitHub

```bash
docker run -p 3000:3000 -v taux-zero-data:/data ghcr.io/aurelie-s06/taux-zero:latest
```

L'image est **privée** au départ. Pour la rendre téléchargeable par tous (ou par un hébergeur) :
page du dépôt, **Packages → taux-zero → Package settings → Change visibility → Public**.

### Construire l'image soi-même

```bash
docker build -t taux-zero .
docker run -p 3000:3000 -v taux-zero-data:/data taux-zero
```

### Exemple avec Railway

1. Sur [railway.com](https://railway.com) : **New Project → Deploy from GitHub repo**, puis choisir
   `taux-zero`. Railway détecte le `Dockerfile`.
2. Dans le service : **Settings → Volumes → Add volume**, point de montage **`/data`**.
3. Dans **Variables**, ajouter `RAILWAY_RUN_UID=0` : les volumes Railway appartiennent à
   l'administrateur, et sans cette variable le serveur ne peut pas écrire la base.
4. **Settings → Networking → Generate Domain** pour obtenir l'adresse publique.
5. Renseigner le nom et l'adresse de l'hébergeur dans [`src/lib/site.ts`](src/lib/site.ts)
   (obligation légale), puis pousser : Railway redéploie à chaque `git push`.

| Variable | Rôle | Valeur dans l'image |
|---|---|---|
| `DATABASE_PATH` | Chemin du fichier de la base | `/data/taux-zero.sqlite` |
| `PORT` | Port du serveur | `3000` |

## Étapes du projet

Le projet a été construit étape par étape, un commit par étape :

| Étape | Contenu |
|---|---|
| 1 | Mise en place du projet Next.js |
| 2 | Moteur de calcul (Widmark) et ses tests |
| 3 | Profil utilisateur et design repris de Mon Budget |
| — | Comptes utilisateurs : inscription, connexion, profil enregistré en base |
| 4 | Saisie des verres et taux en direct |
| 5 | Courbe du taux au fil de la soirée |
| 6 | Finitions : application installable, confidentialité, limitation des essais, Dockerfile |
| 7 | Intégration continue GitHub Actions et image Docker sur ghcr.io |

## Auteure

**Aurélie Sirot** · projet personnel
