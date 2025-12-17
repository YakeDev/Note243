# Déploiement et maintenance

## Aperçu du projet
- Application Next.js (App Router) située dans le dossier `web/`.
- Base de données PostgreSQL gérée via Prisma (schema dans `web/prisma/schema.prisma`).
- Authentification NextAuth v5 (Credentials + PrismaAdapter) avec stratégie JWT.
- Supabase utilisé côté client pour le stockage/DB publique (vars `NEXT_PUBLIC_SUPABASE_*`).

## Mise en place locale
1. **Installer les dépendances**
   ```bash
   cd web
   npm ci
   ```
   Si un mirroring bloque `npm ci`, configurez le registre public :
   ```bash
   npm config set registry https://registry.npmjs.org/
   ```
2. **Variables d'environnement** : copier `.env.example` en `.env.local` et renseigner les clés ci-dessous.
3. **Prisma** :
   ```bash
   npm run prisma:push   # pousse le schema dans la base cible
   npm run seed:categories  # optionnel pour pré-remplir les catégories
   ```
4. **Lancement** :
   ```bash
   npm run dev
   ```
5. **Build local** :
   ```bash
   npm run build
   ```
   (Exécute automatiquement `prisma generate`).

## Variables d'environnement clés
- `NEXTAUTH_SECRET` (obligatoire)
- `NEXTAUTH_URL` (URL complète de l'app, ex: `https://note243.vercel.app`)
- `AUTH_DEBUG` (optionnel: `true` active des logs serveur NextAuth)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` (connexion Postgres utilisée par Prisma)

## Déploiement Vercel
- **Root Directory** : `web`
- **Build Command** : `npm run build`
- **Install Command** : `npm ci`
- **Output** : par défaut (`.next`)
- Ajouter les variables d'environnement ci-dessus dans le projet Vercel.
- Supprimer tout lockfile racine : seul `web/package-lock.json` est conservé pour éviter les warnings de workspace.

## Auth & redirections (production)
- `trustHost` activé dans NextAuth, `NEXTAUTH_URL` doit correspondre à l'URL publique Vercel.
- Le middleware transmet désormais `callbackUrl` lors des redirections vers `/auth/login`, ce qui évite les boucles post-login et renvoie l'utilisateur sur son tableau de bord cible.
- En cas de besoin de diagnostic, définir `AUTH_DEBUG=true` (logs uniquement côté serveur).

## Cache & données établissements
- L'API `GET /api/business` est forcée en `no-store` (`dynamic`, `revalidate=0`, `Cache-Control`), calcule la note moyenne et accepte `sort` (`recent|reviews|rating`) et `minRating`.
- Les pages `app/page.tsx` (home) et `app/explorer/page.tsx` sont dynamiques afin de refléter immédiatement les ajouts/modifications d'établissements.

## Bugs trouvés → cause → correctif
- **TypeScript: "Cannot find namespace 'JSX'"** → absence de `next-env.d.ts` → ajout du fichier standard. (web/next-env.d.ts)
- **Redirect post-login aléatoire** → middleware ne conservait pas la destination protégée → ajout du `callbackUrl` dans la redirection vers `/auth/login` et durcissement du callback `redirect` NextAuth. (web/src/middleware.ts, web/src/auth.ts)
- **Liste des établissements ne se rafraîchissait pas** → route `GET /api/business` utilisait le cache implicite → `dynamic="force-dynamic"`, `Cache-Control: no-store` et calcul de moyenne côté API. (web/src/app/api/business/route.ts)
- **Warning Vercel sur lockfiles multiples** → suppression du `package-lock.json` à la racine, seule la version `web/package-lock.json` est conservée. (repo root)

## Fonctionnalités Trustpilot-like livrées
- Tri/filtre Explorer : recherche + tri (récents, plus d'avis, mieux notés) + filtre de note minimale.
- Badge "Vérifié" pour les établissements certifiés (`BusinessStatus.CERTIFIED`) et affichage de la note moyenne sur les cartes.
- Notes moyennes calculées côté API pour chaque établissement retourné.

## Améliorations proposées (priorisées)
- **Must** :
  - Activer l'envoi email (SMTP) pour la vérification et le reset password ; stocker les secrets côté Vercel (0.5 j).
  - Ajouter l'invalidation automatique des listes après création via mutations client (SWR/React Query) pour un rafraîchissement instantané (0.5 j).
- **Should** :
  - Vue "Top établissements" avec distribution des notes (barres 1–5) et SEO par catégorie/ville (1 j).
  - Module de réponse propriétaire aux avis avec notifications email/Supabase realtime (1.5 j).
- **Could** :
  - Workflow de revendication/preuve (upload ticket) pour délivrer automatiquement le badge "Vérifié" après modération (2 j).
  - Page de modération des signalements d'avis (statut Report) avec filtres et actions en masse (1 j).
