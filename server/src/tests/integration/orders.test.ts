import request from "supertest";
import { createApp } from "../../app";
import { prisma } from "../../prisma/client";

const app = createApp();

describe("Orders & Cart Integration Tests", () => {
  let token: string;
  let userId: string;
  let productId: string;

  const cleanupTestData = async () => {
    const userOrders = await prisma.order.findMany({
      where: { user: { email: { contains: "testorder" } } },
      select: { id: true }
    });
    const orderIds = userOrders.map((o: any) => o.id);
    if (orderIds.length) {
      await prisma.stockReservation.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }
    await prisma.cartItem.deleteMany({ where: { cart: { user: { email: { contains: "testorder" } } } } });
    await prisma.cart.deleteMany({ where: { user: { email: { contains: "testorder" } } } });
    await prisma.user.deleteMany({ where: { email: { contains: "testorder" } } });
    await prisma.product.deleteMany({ where: { slug: { contains: "test-product" } } });
    await prisma.category.deleteMany({ where: { slug: { contains: "test-category" } } });
  };

  beforeAll(async () => {
    await cleanupTestData();

    // Setup Category & Product
    const cat = await prisma.category.create({
      data: { name: "Test Category", slug: "test-category" }
    });
    
    const prod = await prisma.product.create({
      data: {
        name: "Test Product",
        slug: "test-product",
        price: 10.0,
        stock: 100,
        categoryId: cat.id,
        status: "ACTIVE"
      }
    });
    productId = prod.id;

    // Register User
    const vRes = await request(app).post("/api/v1/auth/email/request-verification").send({
      email: "testorder1@example.com"
    });

    const res = await request(app).post("/api/v1/auth/register").send({
      email: "testorder1@example.com",
      password: "password123",
      name: "Test Order",
      verificationCode: vRes.body.devVerificationCode
    });
    token = res.body.token;
    userId = res.body.user.id;
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  it("should add an item to the cart", async () => {
    const res = await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId,
        quantity: 2,
        variantKey: "default"
      });

    expect([200, 201]).toContain(res.status);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it("should create an order from cart", async () => {
    const res = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        shippingName: "Test Order",
        shippingAddress: "123 Test St",
        shippingCity: "Test City",
        shippingZip: "12345",
        shippingCountry: "US"
      });

    // We assume 201 Created and it returns the order.
    expect([201, 200]).toContain(res.status);
    expect(res.body.id).toBeDefined();
    expect(res.body.totalAmount).toBeDefined();
    expect(res.body.status).toBe("PENDING");
  });
});
