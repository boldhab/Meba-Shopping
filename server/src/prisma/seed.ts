import 'dotenv/config';
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "@prisma/client";
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

  // Create Products
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const products: Prisma.ProductUncheckedCreateInput[] = [
    {
      name: "Wireless Headphones",
      slug: "wireless-headphones",
      description: "Noise-cancelling over-ear headphones with 40h battery life.",
      price: 129.99,
      stock: 15,
      categoryId: categoriesMap["electronics"].id,
      dealType: "DAILY",
      isDealActive: true,
      dealStartAt: now,
      dealEndAt: tomorrow,
    },
    {
      name: "Smart Watch Series 5",
      slug: "smart-watch-5",
      description: "Advanced fitness tracking and heart rate monitor.",
      price: 249.00,
      stock: 10,
      categoryId: categoriesMap["electronics"].id,
      dealType: "WEEKLY",
      isDealActive: true,
      dealStartAt: now,
      dealEndAt: nextWeek,
    },
    {
      name: "Classic Denim Jacket",
      slug: "denim-jacket",
      description: "Timeless blue denim jacket with a relaxed fit.",
      price: 59.90,
      stock: 25,
      categoryId: categoriesMap["fashion"].id,
      dealType: "CLEARANCE",
      isDealActive: true,
      dealStartAt: now,
    },
    {
      name: "Premium Blender",
      slug: "premium-blender",
      description: "High-speed blender for smoothies and soups.",
      price: 89.99,
      stock: 12,
      categoryId: categoriesMap["home-kitchen"].id,
    },
    {
      name: "Moisturizing Cream",
      slug: "moisturizing-cream",
      description: "Hydrating face cream with hyaluronic acid.",
      price: 24.50,
      stock: 40,
      categoryId: categoriesMap["beauty-personal-care"].id,
      dealType: "CEREMONY",
      isDealActive: true,
      dealStartAt: now,
      dealEndAt: nextWeek,
    },
    {
      name: "Yoga Mat",
      slug: "yoga-mat",
      description: "Non-slip eco-friendly yoga mat (6mm).",
      price: 35.00,
      stock: 20,
      categoryId: categoriesMap["health-fitness"].id,
    },
    {
      name: "Organic Bananas",
      slug: "organic-bananas",
      description: "Fresh bunch of organic bananas.",
      price: 1.99,
      stock: 50,
      categoryId: categoriesMap["fresh-produce"].id,
    },
    {
      name: "Whole Milk",
      slug: "whole-milk",
      description: "1 gallon of vitamin D whole milk.",
      price: 4.29,
      stock: 30,
      categoryId: categoriesMap["dairy-and-eggs"].id,
    },
    {
      name: "Sourdough Bread",
      slug: "sourdough-bread",
      description: "Artisan sourdough loaf, baked fresh.",
      price: 6.50,
      stock: 20,
      categoryId: categoriesMap["bakery"].id,
    },
    {
      name: "Dog Plush Toy",
      slug: "dog-plush-toy",
      description: "Soft squeaky plush toy for puppies.",
      price: 12.99,
      stock: 35,
      categoryId: categoriesMap["pet-supplies"].id,
    },
  ];

  const normalizedProducts = products.map((product) => ({
    ...product,
    dealType: product.dealType ?? null,
    isDealActive: product.isDealActive ?? false,
    dealStartAt: product.dealStartAt ?? null,
    dealEndAt: product.dealEndAt ?? null,
  }));

  for (const product of normalizedProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
        dealType: product.dealType,
        isDealActive: product.isDealActive,
        dealStartAt: product.dealStartAt,
        dealEndAt: product.dealEndAt,
      },
      create: product,
    });
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
