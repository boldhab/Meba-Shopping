import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../../app";
import { prisma } from "../../prisma/client";
import { env } from "../../config/env";

const app = createApp();

describe("Admin Integration Tests", () => {
  let adminToken: string;
  let adminUserId: string;

  beforeAll(async () => {
    // Clean up any test artifacts
    await prisma.review.deleteMany({ where: { comment: { contains: "AdminTestReview" } } });
    await prisma.coupon.deleteMany({ where: { code: { startsWith: "TEST" } } });
    await prisma.category.deleteMany({ where: { slug: { startsWith: "test-admin-cat" } } });
    await prisma.product.deleteMany({ where: { slug: { startsWith: "csv-test-prod" } } });
    await prisma.user.deleteMany({ where: { email: "admin-integration-test@meba.com" } });

    // Create an admin user
    const adminUser = await prisma.user.create({
      data: {
        email: "admin-integration-test@meba.com",
        passwordHash: "hash123",
        name: "Admin Tester",
        role: "ADMIN",
      },
    });
    adminUserId = adminUser.id;

    adminToken = jwt.sign(
      { sub: adminUser.id, userId: adminUser.id, email: adminUser.email, role: adminUser.role },
      env.jwtSecret,
      { expiresIn: "1h" }
    );
  });

  afterAll(async () => {
    await prisma.review.deleteMany({ where: { comment: { contains: "AdminTestReview" } } });
    await prisma.coupon.deleteMany({ where: { code: { startsWith: "TEST" } } });
    await prisma.category.deleteMany({ where: { slug: { startsWith: "test-admin-cat" } } });
    await prisma.product.deleteMany({ where: { slug: { startsWith: "csv-test-prod" } } });
    if (adminUserId) {
      await prisma.user.deleteMany({ where: { id: adminUserId } });
    }
    await prisma.$disconnect();
  });

  describe("Admin Reviews (Fix 3.1)", () => {
    it("should return 200 with review items for GET /api/v1/admin/reviews", async () => {
      const res = await request(app)
        .get("/api/v1/admin/reviews")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toBeDefined();
      expect(Array.isArray(res.body.items)).toBe(true);
      expect(typeof res.body.total).toBe("number");
    });
  });

  describe("Admin Product CSV Import (Fix 3.2 & Fix 3.3)", () => {
    it("should accept .csv file and parse commas inside quotes properly", async () => {
      const csvData = [
        "name,slug,price,stock,status,isFeatured",
        '"CSV Fresh Apple, Organic",csv-test-prod-1,25.5,50,ACTIVE,true',
        '"CSV Whole Milk, 1L",csv-test-prod-2,15.0,100,ACTIVE,false',
      ].join("\n");

      const res = await request(app)
        .post("/api/v1/admin/products/import")
        .set("Authorization", `Bearer ${adminToken}`)
        .attach("file", Buffer.from(csvData), "products.csv");

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);

      const prod1 = await prisma.product.findUnique({ where: { slug: "csv-test-prod-1" } });
      expect(prod1).toBeDefined();
      expect(prod1?.name).toBe("CSV Fresh Apple, Organic");
      expect(Number(prod1?.price)).toBe(25.5);
    });
  });

  describe("Admin Category CRUD (Fix 3.4)", () => {
    let createdCatId: string;

    it("should create a new category via POST /api/v1/admin/categories", async () => {
      const res = await request(app)
        .post("/api/v1/admin/categories")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Test Admin Category", slug: "test-admin-cat-1" });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.slug).toBe("test-admin-cat-1");
      createdCatId = res.body.id;
    });

    it("should list categories with product counts via GET /api/v1/admin/categories", async () => {
      const res = await request(app)
        .get("/api/v1/admin/categories")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const cat = res.body.find((c: any) => c.id === createdCatId);
      expect(cat).toBeDefined();
      expect(typeof cat.productCount).toBe("number");
    });

    it("should update a category via PATCH /api/v1/admin/categories/:id", async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/categories/${createdCatId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Updated Admin Category" });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Updated Admin Category");
    });

    it("should delete a category via DELETE /api/v1/admin/categories/:id", async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/categories/${createdCatId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(204);

      const found = await prisma.category.findUnique({ where: { id: createdCatId } });
      expect(found).toBeNull();
    });
  });

  describe("Admin Coupon CRUD (Fix 3.5)", () => {
    let createdCouponId: string;

    it("should create a coupon via POST /api/v1/admin/coupons", async () => {
      const res = await request(app)
        .post("/api/v1/admin/coupons")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          code: "TESTSAVE15",
          discountPercent: 15,
          isActive: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.code).toBe("TESTSAVE15");
      expect(res.body.discountPercent).toBe(15);
      createdCouponId = res.body.id;
    });

    it("should validate the created coupon via GET /api/v1/coupons/validate", async () => {
      const res = await request(app)
        .get("/api/v1/coupons/validate?code=TESTSAVE15");

      expect(res.status).toBe(200);
      expect(res.body.code).toBe("TESTSAVE15");
      expect(res.body.discountPercent).toBe(15);
    });

    it("should list coupons via GET /api/v1/admin/coupons", async () => {
      const res = await request(app)
        .get("/api/v1/admin/coupons")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const coupon = res.body.find((c: any) => c.id === createdCouponId);
      expect(coupon).toBeDefined();
    });

    it("should update a coupon via PATCH /api/v1/admin/coupons/:id", async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/coupons/${createdCouponId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ discountPercent: 20 });

      expect(res.status).toBe(200);
      expect(res.body.discountPercent).toBe(20);
    });

    it("should delete a coupon via DELETE /api/v1/admin/coupons/:id", async () => {
      const res = await request(app)
        .delete(`/api/v1/admin/coupons/${createdCouponId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(204);

      const found = await prisma.coupon.findUnique({ where: { id: createdCouponId } });
      expect(found).toBeNull();
    });
  });

  describe("Analytics Protection & Metrics (Fix 4.4)", () => {
    it("should reject unauthenticated requests to GET /api/v1/analytics with 401", async () => {
      const res = await request(app).get("/api/v1/analytics");
      expect(res.status).toBe(401);
    });

    it("should return metrics for authenticated admin on GET /api/v1/analytics", async () => {
      const res = await request(app)
        .get("/api/v1/analytics")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.summary).toBeDefined();
      expect(typeof res.body.summary.totalRevenue).toBe("number");
      expect(typeof res.body.summary.totalOrders).toBe("number");
      expect(typeof res.body.summary.totalUsers).toBe("number");
    });
  });

  describe("HTTP-Only Cookie Session Security (Fix 4.5)", () => {
    it("should authenticate using Cookie header token", async () => {
      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", `token=${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe("admin-integration-test@meba.com");
    });

    it("should clear cookie upon POST /api/v1/auth/logout", async () => {
      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", `token=${adminToken}`);

      expect(res.status).toBe(200);
      const setCookie = res.headers["set-cookie"];
      expect(setCookie).toBeDefined();
      expect(setCookie[0]).toMatch(/token=;/);
    });
  });
});
