import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seed() {
  console.log("Seeding database...");

  // Create Categories
  const freshProduce = await prisma.category.upsert({
    where: { slug: "fresh-produce" },
    update: {},
    create: {
      name: "Fresh Produce",
      slug: "fresh-produce",
    },
  });

  const dairyAndEggs = await prisma.category.upsert({
    where: { slug: "dairy-and-eggs" },
    update: {},
    create: {
      name: "Dairy & Eggs",
      slug: "dairy-and-eggs",
    },
  });

  const bakery = await prisma.category.upsert({
    where: { slug: "bakery" },
    update: {},
    create: {
      name: "Bakery",
      slug: "bakery",
    },
  });

  // Create Products
  const products = [
    {
      name: "Organic Bananas",
      slug: "organic-bananas",
      description: "Fresh bunch of organic bananas.",
      price: 1.99,
      stock: 50,
      categoryId: freshProduce.id,
    },
    {
      name: "Gala Apples",
      slug: "gala-apples",
      description: "Crisp and sweet gala apples.",
      price: 3.49,
      stock: 100,
      categoryId: freshProduce.id,
    },
    {
      name: "Whole Milk",
      slug: "whole-milk",
      description: "1 gallon of vitamin D whole milk.",
      price: 4.29,
      stock: 30,
      categoryId: dairyAndEggs.id,
    },
    {
      name: "Organic Eggs",
      slug: "organic-eggs",
      description: "Dozen large organic brown eggs.",
      price: 5.99,
      stock: 40,
      categoryId: dairyAndEggs.id,
    },
    {
      name: "Sourdough Bread",
      slug: "sourdough-bread",
      description: "Artisan sourdough loaf, baked fresh.",
      price: 6.50,
      stock: 20,
      categoryId: bakery.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

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
