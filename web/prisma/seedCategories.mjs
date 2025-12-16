import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

dotenv.config({ path: "./.env" });

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
      "Boulangeries & pÇ½tisseries",
      "Ç%piceries & supermarchÇ¸s",
      "Bars & cafÇ¸s",
      "Restaurants",
      "Vins & spiritueux",
      "Traiteurs & Ç¸vÇ¸nementiel",
    ],
  },
  {
    name: "Ç%lectronique & technologie",
    subs: [
      "Ordinateurs & pÇ¸riphÇ¸riques",
      "TÇ¸lÇ¸phones & tablettes",
      "Audio & vidÇ¸o",
      "Ç%lectromÇ¸nager",
      "Jeux & consoles",
    ],
  },
  {
    name: "SantÇ¸ & mÇ¸decine",
    subs: [
      "Cliniques & hÇïpitaux",
      "MÇ¸decins & spÇ¸cialistes",
      "Pharmacies",
      "Opticiens & audition",
      "Laboratoires",
    ],
  },
  {
    name: "Services publics & locaux",
    subs: [
      "Ç%coles & formation",
      "Institutions publiques",
      "Administration locale",
      "Transports urbains",
      "Services d'urgence",
    ],
  },
  {
    name: "Animaux",
    subs: ["VÇ¸tÇ¸rinaires", "Boutiques animales", "Toilettage & soins", "Pensions & gardes"],
  },
  {
    name: "Argent & assurance",
    subs: [
      "Banques & microfinance",
      "Assurance auto & habitation",
      "Conseil financier",
      "Investissement & Ç¸pargne",
    ],
  },
  {
    name: "Maison & jardin",
    subs: [
      "Construction & rÇ¸novation",
      "DÇ¸coration intÇ¸rieure",
      "Mobilier & literie",
      "Jardinage & plein air",
    ],
  },
  {
    name: "Services aux entreprises",
    subs: [
      "Marketing & communication",
      "ComptabilitÇ¸ & finances",
      "RH & recrutement",
      "Informatique & cybersÇ¸curitÇ¸",
      "Logistique & transport",
    ],
  },
  {
    name: "Services",
    subs: ["Ç%nergie & Ç¸lectricitÇ¸", "Plomberie & entretien", "Nettoyage & blanchisserie", "SÇ¸curitÇ¸ & surveillance"],
  },
  {
    name: "Shopping & mode",
    subs: ["VÇ¦tements & chaussures", "Accessoires & bijoux", "Parfums & beautÇ¸", "Magasins spÇ¸cialisÇ¸s"],
  },
  {
    name: "Sport & loisirs",
    subs: ["Salles de sport & fitness", "Clubs & associations", "Parcs & activitÇ¸s", "HÇïtels & loisirs"],
  },
  {
    name: "Voyages & transport",
    subs: ["Agences de voyage", "HÇïtels & hÇ¸bergements", "Location de vÇ¸hicules", "Taxis & navettes"],
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
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
