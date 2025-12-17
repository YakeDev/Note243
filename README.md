# NOTE243 — Documentation Technique Complète

Plateforme Locale d’Avis Clients (Lubumbashi)

---

## 1. Introduction

Note243 est une plateforme web destinée à centraliser les avis clients sur les établissements locaux de Lubumbashi. L’application repose sur une architecture moderne comprenant un **frontend Next.js**, un **backend intégré via API Routes**, ainsi qu’une base de données **PostgreSQL/Supabase** manipulée via **Prisma ORM**.
Ce document présente le README complet incluant la **stack**, l’architecture, la **structure frontend**, la **structure backend**, les commandes d’installation et les conventions techniques du projet.

---

## 2. Technologies Utilisées (dernières versions stables uniquement)

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL / Supabase
- NextAuth (Auth.js)
- Zod (validation schémas)
- ESLint + Prettier

L’installation se fait systématiquement via :

```
npm install <package>
```

(pour garantir l’usage des dernières versions stables)

---

## 3. Installation du Projet

### 3.1 Cloner le repository

```
git clone https://github.com/<username>/note243.git
cd note243
```

### 3.2 Installer les dépendances

```
npm install
```

### 3.3 Configurer les variables d’environnement

Créer un fichier `.env` :

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NEXTAUTH_SECRET="secret-generated"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 4. Initialisation de Prisma

```
npx prisma init
npx prisma db push
```

Lancer Prisma Studio :

```
npx prisma studio
```

---

## 5. Lancement de l’Application

```
npm run dev
```

Application accessible via : `http://localhost:3000`

---

## 6. Architecture Générale du Projet

Le projet est structuré en deux blocs principaux :

### 6.1 FRONTEND (Next.js App Router)

- Rendu côté serveur (SSR)
- Pages dynamiques pour fiches établissements
- UI conforme au design Figma
- Gestion état / formulaires / interactions

### 6.2 BACKEND

- API Routes Next.js (`/src/app/api/*`)
- Prisma Client
- Services métier (clean architecture)
- Authentification via NextAuth
- Validation des données via Zod

---

## 7. Structure Complète du Frontend (`/src/app`)

```
src/app/
 ├── (public)/
 │     ├── page.tsx                 # Page d’accueil
 │     ├── explorer/page.tsx        # Recherche + catégories
 │     └── business/
 │          └── [id]/page.tsx       # Fiche établissement
 │
 ├── review/
 │     └── new/page.tsx             # Laisser un avis
 │
 ├── auth/
 │     ├── login/page.tsx
 │     └── register/page.tsx
 │
 ├── dashboard/
 │     ├── owner/page.tsx           # Dashboard entreprises
 │     └── admin/page.tsx           # Admin : signalements, vérifications
 │
 ├── api/                           # Backend intégré
 │     ├── business/
 │     │      ├── route.ts          # GET/POST listing établissement
 │     │      └── [id]/route.ts      # GET/MODIFY fiche établissement
 │     ├── review/
 │     │      ├── route.ts          # POST créer un avis
 │     │      └── [id]/route.ts      # DELETE/MODIFIER avis
 │     ├── claim/route.ts           # Revendication des fiches
 │     ├── report/route.ts          # Signalements des avis
 │     └── auth/[...nextauth]/route.ts
 │
 ├── layout.tsx
 └── globals.css
```

---

## 8. Structure Complète du Backend (API Routes + Services)

```
src/
 ├── app/api/
 │     ├── business/
 │     │      ├── route.ts
 │     │      └── [id]/route.ts
 │     ├── review/
 │     │      ├── route.ts
 │     │      └── [id]/route.ts
 │     ├── claim/route.ts
 │     ├── report/route.ts
 │     └── auth/[...nextauth]/route.ts
 │
 ├── lib/
 │     ├── prisma.ts                # Prisma Client
 │     ├── auth.ts                  # next-auth config
 │     ├── validators/              # schémas Zod
 │     │       ├── review.schema.ts
 │     │       ├── business.schema.ts
 │     │       └── claim.schema.ts
 │     └── utils/
 │            ├── rating.ts         # Calcul des moyennes
 │            ├── pagination.ts
 │            └── responses.ts
 │
 ├── services/                      # Logique métier (clean architecture)
 │     ├── business.service.ts
 │     ├── review.service.ts
 │     ├── claim.service.ts
 │     └── report.service.ts
 │
 └── types/
        └── index.ts
```

---

## 9. Structure de la Base de Données (Prisma)

Tables principales :

- User
- Business
- Review
- Favorite
- Claim
- Report
- Category

Les modèles se trouvent dans :

```
prisma/schema.prisma
```

---

## 10. Scripts NPM

```
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "prisma:push": "prisma db push",
  "prisma:studio": "prisma studio"
}
```

---

## 11. Règles pour l’Agent IA (Codex)

L’agent doit :

1. Installer uniquement les dernières versions stables (`npm install ...`).
2. Respecter strictement les UI Figma.
3. Ne jamais inventer de composants hors design.
4. Produire du code propre, typé, structuré.
5. Suivre la structure frontend/backend définie dans ce document.

---

## 12. Roadmap Projet

### Phase 1 — Setup & Fondations

- Installation du projet
- Configuration Tailwind + Design System
- Prisma + Base Supabase

### Phase 2 — Pages publiques

- Accueil
- Explorer
- Fiche établissement
- Laisser un avis

### Phase 3 — Espaces privés

- Dashboard Entreprise
- Dashboard Admin

### Phase 4 — Production

- Tests
- Optimisations
- Déploiement Vercel + Supabase

---

## 13. Licence

Projet développé par : Eric Kayembe & Steve Masengo

---

## 14. Contact

<contact@note243.cd>
