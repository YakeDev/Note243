# Note243 — Liste d’Issues Pour Démarrer le Développement
Ces issues constituent le backlog initial pour lancer le développement de l’application Note243 avant l’intégration complète du design Figma. Elles couvrent les étapes fondamentales : setup, architecture, base de données, API, pages publiques, outils de développement.

---

## ISSUE 1 — Initialiser le projet Next.js + TypeScript
**Description** : Créer un nouveau projet Next.js utilisant TypeScript.
**Tâches** :
- Exécuter `npx create-next-app@latest --ts note243`.
- Nettoyer les fichiers par défaut.
- Configurer les alias d'import.
**Livrables** : Structure propre du projet.

---

## ISSUE 2 — Installer et configurer Tailwind CSS
**Description** : Ajouter Tailwind CSS pour la future intégration UI.
**Tâches** :
- `npm install tailwindcss postcss autoprefixer`
- `npx tailwindcss init -p`
- Configurer `tailwind.config.js`
- Intégrer Tailwind dans `globals.css`
**Livrables** : Setup Tailwind opérationnel.

---

## ISSUE 3 — Installer Prisma et initialiser la base de données
**Description** : Préparer Prisma et la connexion Postgres/Supabase.
**Tâches** :
- `npm install prisma @prisma/client`
- `npx prisma init`
- Créer `.env`
- Configurer `DATABASE_URL`
**Livrables** : Prisma initialisé + connexion prête.

---

## ISSUE 4 — Définir le schema Prisma initial (User, Business, Review…)
**Description** : Définir les modèles de base nécessaires.
**Tâches** :
- Créer modèles : User, Business, Category, Review, Favorite, Claim, Report.
- Définir relations (1-n, n-n).
- `npx prisma db push`.
- Tester dans Prisma Studio.
**Livrables** : Base de données opérationnelle.

---

## ISSUE 5 — Créer Prisma Client centralisé (`src/lib/prisma.ts`)
**Description** : Préparer l’accès unique à la DB.
**Tâches** :
- Créer fichier lib/prisma.ts.
- Ajouter anti-multiplication d’instances en dev.
**Livrables** : Prisma accessible dans tout le projet.

---

## ISSUE 6 — Créer la structure des API Routes (backend)
**Description** : Créer la structure du backend avant le contenu.
**Tâches** :
- Ajouter dossiers API : business, review, claim, report.
- Préparer fichiers route.ts.
- Ajouter handlers GET/POST vides.
**Livrables** : API skeleton prête à implémenter.

---

## ISSUE 7 — Implémenter l’API “Business” (CRUD minimal)
**Description** : Gestion des établissements.
**Tâches** :
- `GET /api/business` → liste des établissements
- `GET /api/business/[id]` → fiche
- `POST /api/business` → création
- Ajouter validation Zod
**Livrables** : API fonctionnelle.

---

## ISSUE 8 — Implémenter l’API “Review” (création + listing)
**Description** : Gestion des avis utilisateurs.
**Tâches** :
- `POST /api/review` → ajouter un avis
- `GET /api/review?businessId=`
- Validation Zod (rating, commentaire)
- Vérification que le business existe
**Livrables** : Système d’avis fonctionnel.

---

## ISSUE 9 — Préparer l’authentification (NextAuth structure vide)
**Description** : Mise en place basique de NextAuth.
**Tâches** :
- Installer NextAuth
- `src/app/api/auth/[...nextauth]/route.ts`
- Ajouter provider Email (placeholder)
**Livrables** : Auth structure en place.

---

## ISSUE 10 — Créer la structure frontend de base (App Router)
**Description** : Préparer les routes principales sans UI.
**Tâches** :
- Page Home : `/`
- Page Explorer : `/explorer`
- Page Business : `/business/[id]`
- Page Review : `/review/new`
- Dashboard Owner : `/dashboard/owner`
- Dashboard Admin : `/dashboard/admin`
**Livrables** : Navigation basique prête.

---

## ISSUE 11 — Ajouter Layout global + Header minimal
**Description** : Préparer la structure avant l’intégration Figma.
**Tâches** :
- Créer layout.tsx avec header simple
- Ajouter navigation de base
- Ajouter conteneur et structure responsive
**Livrables** : Interface minimale fonctionnelle.

---

## ISSUE 12 — Implémenter la récupération des données côté frontend
**Description** : Connecter pages + API.
**Tâches** :
- Page Explorer → fetch liste business
- Page Business → fetch fiche + avis
- Page Review → POST avis
**Livrables** : App connectée de bout en bout.

---

## ISSUE 13 — Ajouter Zod (validation frontend + backend)
**Description** : Sécuriser les inputs.
**Tâches** :
- Installer Zod
- Créer validators : business, review
- Intégrer dans API et formulaires
**Livrables** : Validation end-to-end.

---

## ISSUE 14 — Ajouter ESLint + Prettier + conventions
**Description** : Assurer la qualité du code.
**Tâches** :
- Installer ESLint + Prettier
- Ajouter config standard Next.js
- Ajouter scripts npm
**Livrables** : Code propre et formaté.

---

## ISSUE 15 — Préparer la future intégration Figma (Design System placeholder)
**Description** : Créer l’espace pour accueillir tokens Figma.
**Tâches** :
- Créer fichier `/src/styles/design-system.css`
- Préparer sections : couleurs, radius, spacing
- Ajouter variables CSS vides
**Livrables** : Base prête pour la charte graphique.

---

# Total : 15 Issues Pour Lancer le Développement
Ces issues permettent :
- d’avoir un projet fonctionnel end-to-end,
- sans UI Figma pour l’instant,
- avec une architecture propre et prête à évoluer.

Lorsque tu seras prêt pour l’intégration Figma, nous créerons une nouvelle série d’issues UI/UX.

