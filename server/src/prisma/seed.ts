import 'dotenv/config';
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";
import { hashPassword } from "../utils/hashPassword";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_ADMIN_EMAIL = "admin@meba.local";
const DEFAULT_ADMIN_PASSWORD = "Admin1234!";
const DEFAULT_ADMIN_NAME = "Meba Admin";

export async function seed() {
  console.log("Seeding database...");

  const adminPasswordHash = await hashPassword(DEFAULT_ADMIN_PASSWORD);

  await prisma.user.upsert({
    where: { email: DEFAULT_ADMIN_EMAIL },
    update: {
      name: DEFAULT_ADMIN_NAME,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
    create: {
      name: DEFAULT_ADMIN_NAME,
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  await prisma.product.deleteMany({
    where: {
      slug: {
        in: [
          "wireless-headphones",
          "smart-watch-5",
          "denim-jacket",
          "premium-blender",
          "moisturizing-cream",
          "yoga-mat",
          "organic-bananas",
          "whole-milk",
          "sourdough-bread",
          "dog-plush-toy",
          "gala-apples",
          "organic-eggs",
        ],
      },
    },
  });

  // Define Category Data
  const categoriesData = [
    { name: "Electronics", slug: "electronics" },
    { name: "Fashion", slug: "fashion" },
    { name: "Home & Kitchen", slug: "home-kitchen" },
    { name: "Beauty & Personal Care", slug: "beauty-personal-care" },
    { name: "Groceries", slug: "groceries" },
    { name: "Health & Fitness", slug: "health-fitness" },
    { name: "Books & Media", slug: "books-media" },
    { name: "Toys & Games", slug: "toys-games" },
    { name: "Automotive", slug: "automotive" },
    { name: "Office Supplies", slug: "office-supplies" },
    { name: "Pet Supplies", slug: "pet-supplies" },
    { name: "Fresh Produce", slug: "fresh-produce" },
    { name: "Dairy & Eggs", slug: "dairy-and-eggs" },
    { name: "Bakery", slug: "bakery" },
  ];

  const categoriesMap: Record<string, any> = {};

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categoriesMap[cat.slug] = created;
  }

  console.log(`Seeded admin user: ${DEFAULT_ADMIN_EMAIL} / ${DEFAULT_ADMIN_PASSWORD}`);
  console.log("Seeding complete!");
}

if (require.main === module) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
