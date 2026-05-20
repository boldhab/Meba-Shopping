import request from "supertest";
import { createApp } from "../../app";
import { prisma } from "../../prisma/client";

const app = createApp();

describe("Products Integration Tests", () => {
  let productId: string;

  beforeAll(async () => {
    // Clean up
    await prisma.product.deleteMany({ where: { slug: { contains: "test-prod-int" } } });
    await prisma.category.deleteMany({ where: { slug: { contains: "test-cat-int" } } });

    // Seed category + product
    const cat = await prisma.category.create({
      data: { name: "Test Cat Int", slug: "test-cat-int" },
    });

    const prod = await prisma.product.create({
      data: {
        name: "Test Prod Int",
        slug: "test-prod-int",
        price: 29.99,
        stock: 50,
        categoryId: cat.id,
      },
    });
    productId = prod.id;
  });

  afterAll(async () => {
    await prisma.product.deleteMany({ where: { slug: { contains: "test-prod-int" } } });
    await prisma.category.deleteMany({ where: { slug: { contains: "test-cat-int" } } });
    await prisma.$disconnect();
  });

  it("GET /api/v1/products - returns a list of products", async () => {
    const res = await request(app).get("/api/v1/products");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items ?? res.body)).toBe(true);
  });

  it("GET /api/v1/products/:slug - returns a single product by slug", async () => {
    const res = await request(app).get("/api/v1/products/test-prod-int");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(productId);
    expect(res.body.name).toBe("Test Prod Int");
    expect(Number(res.body.price)).toBeCloseTo(29.99);
  });

  it("GET /api/v1/products/:slug - returns 404 for non-existent product", async () => {
    const res = await request(app).get("/api/v1/products/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("GET /api/v1/products?search=Test - filters by search term", async () => {
    const res = await request(app).get("/api/v1/products?search=Test+Prod+Int");
    expect(res.status).toBe(200);
    const items: any[] = res.body.items ?? res.body;
    const found = items.find((p: any) => p.slug === "test-prod-int");
    expect(found).toBeDefined();
  });
});
