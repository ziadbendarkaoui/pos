# Administration en ligne

Site : https://pos.ziadbendarkaoui.workers.dev/

Dashboard : https://pos.ziadbendarkaoui.workers.dev/#admin

Le bouton Enregistrer publie le formulaire via une API protégée par le secret
Cloudflare `ADMIN_PASSWORD`. Le mot de passe est conservé seulement en mémoire
dans la page, jamais dans le dépôt ni dans localStorage.

Le contenu est enregistré dans la base D1 `tasty-pizza-content` et les photos
WebP importées dans le namespace KV `MENU_IMAGES`. Les photos existantes restent
dans les assets du site. Le site public recharge le catalogue au démarrage,
au retour dans la fenêtre et toutes les 30 secondes lorsqu’il est visible.
GitHub Pages utilise la même API Cloudflare avec une origine CORS autorisée.

Les anciennes modifications locales peuvent être récupérées explicitement dans
le dashboard puis publiées. Elles ne remplacent jamais automatiquement le menu
partagé. Une révision atomique D1 empêche un ancien formulaire d’écraser une
publication plus récente. « Restaurer l’origine » prépare un formulaire ; il
faut encore Enregistrer pour publier cette restauration.

## Maintenance

```sh
npm ci
npm run lint
npm test
npm run build
npx wrangler whoami
npx wrangler deploy --dry-run
npx wrangler deploy
```

La migration initiale se trouve dans `migrations/0001_content.sql`.
Pour une nouvelle installation : créer les ressources, reporter leurs identifiants
dans `wrangler.jsonc`, exécuter les migrations puis configurer le secret.

```sh
npx wrangler d1 migrations apply tasty-pizza-content --remote
npx wrangler secret put ADMIN_PASSWORD
```

Le déploiement GitHub/Cloudflare doit utiliser `npm run build` puis
`npx wrangler deploy`, sans remplacer la configuration par un déploiement
statique seul. Ne pas ajouter le mot de passe aux variables Vite.

Les photos sont limitées à 1 Mio chacune et le JSON du catalogue à 512 Kio.
La propagation initiale d’une nouvelle photo KV peut prendre un court délai.
Les anciennes images importées sont conservées pour ne pas casser les anciens
paniers et permettre une récupération. Aucun nettoyage destructif automatique.

Les tests Node couvrent authentification, validation, concurrence et CORS.
Le runtime local workerd peut échouer sur certaines installations Windows ;
dans ce cas, compléter la compilation à blanc par les contrôles HTTP en ligne.
