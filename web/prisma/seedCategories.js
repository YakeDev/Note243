/* eslint-disable no-console */
require("dotenv").config({ path: "./.env" });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL manquant. Ajoutez-le dans .env avant de lancer le seed.");
}

const pool = new Pool({ connectionString });
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const categories = [
  {
    name: "Aliments, boissons & tabac",
    subs: [
      "Boulangeries & pâtisseries",
      "Épiceries & supermarchés",
      "Bars & cafés",
      "Restaurants",
      "Vins & spiritueux",
      "Traiteurs & événementiel",
    ],
  },
  {
    name: "Électronique & technologie",
    subs: [
      "Ordinateurs & périphériques",
      "Téléphones & tablettes",
      "Audio & vidéo",
      "Électroménager",
      "Jeux & consoles",
    ],
  },
  {
    name: "Santé & médecine",
    subs: [
      "Cliniques & hôpitaux",
      "Médecins & spécialistes",
      "Pharmacies",
      "Opticiens & audition",
      "Laboratoires",
    ],
  },
  {
    name: "Services publics & locaux",
    subs: [
      "Écoles & formation",
      "Institutions publiques",
      "Administration locale",
      "Transports urbains",
      "Services d'urgence",
    ],
  },
  {
    name: "Animaux",
    subs: ["Vétérinaires", "Boutiques animales", "Toilettage & soins", "Pensions & gardes"],
  },
  {
    name: "Argent & assurance",
    subs: [
      "Banques & microfinance",
      "Assurance auto & habitation",
      "Conseil financier",
      "Investissement & épargne",
    ],
  },
  {
    name: "Maison & jardin",
    subs: [
      "Construction & rénovation",
      "Décoration intérieure",
      "Mobilier & literie",
      "Jardinage & plein air",
    ],
  },
  {
    name: "Services aux entreprises",
    subs: [
      "Marketing & communication",
      "Comptabilité & finances",
      "RH & recrutement",
      "Informatique & cybersécurité",
      "Logistique & transport",
    ],
  },
  {
    name: "Services",
    subs: ["Énergie & électricité", "Plomberie & entretien", "Nettoyage & blanchisserie", "Sécurité & surveillance"],
  },
  {
    name: "Shopping & mode",
    subs: ["Vêtements & chaussures", "Accessoires & bijoux", "Parfums & beauté", "Magasins spécialisés"],
  },
  {
    name: "Sport & loisirs",
    subs: ["Salles de sport & fitness", "Clubs & associations", "Parcs & activités", "Hôtels & loisirs"],
  },
  {
    name: "Voyages & transport",
    subs: ["Agences de voyage", "Hôtels & hébergements", "Location de véhicules", "Taxis & navettes"],
  },
];

const slugify = (str) =>
  str
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function main() {
  for (const cat of categories) {
    const parent = await prisma.category.upsert({
      where: { slug: slugify(cat.name) },
      update: { name: cat.name },
      create: { name: cat.name, slug: slugify(cat.name) },
    });

    for (const sub of cat.subs) {
      await prisma.category.upsert({
        where: { slug: slugify(`${cat.name}-${sub}`) },
        update: { name: sub, parentId: parent.id },
        create: { name: sub, slug: slugify(`${cat.name}-${sub}`), parentId: parent.id },
      });
    }
  }
}

main()
  .then(async () => {
    console.log("Categories seeded");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
