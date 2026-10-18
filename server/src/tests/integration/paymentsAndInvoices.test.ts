import request from "supertest";
import { createApp } from "../../app";
import { prisma } from "../../prisma/client";

const app = createApp();

describe("Payments & PDF Invoices Integration Tests", () => {
  let token: string;
  let userId: string;
  let orderId: string;
  let productId: string;
  let categoryId: string;

  const cleanupTestData = async () => {
    const orders = await prisma.order.findMany({
      where: { user: { email: { contains: "testmobile" } } },
      select: { id: true }
    });
    const orderIds = orders.map((o: any) => o.id);
    if (orderIds.length) {
      await prisma.stockReservation.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }
    await prisma.cartItem.deleteMany({ where: { cart: { user: { email: { contains: "testmobile" } } } } });
    await prisma.cart.deleteMany({ where: { user: { email: { contains: "testmobile" } } } });
    await prisma.user.deleteMany({ where: { email: { contains: "testmobile" } } });
    await prisma.product.deleteMany({ where: { slug: { contains: "test-mobile-prod" } } });
    await prisma.category.deleteMany({ where: { slug: { contains: "test-mobile-cat" } } });
  };

  beforeAll(async () => {
    await cleanupTestData();

    // 1. Create Category & Product
    const cat = await prisma.category.create({
      data: { name: "Mobile Money Test Category", slug: "test-mobile-cat" }
    });
    categoryId = cat.id;

    const prod = await prisma.product.create({
      data: {
        name: "Test Mobile Honey Jar",
        slug: "test-mobile-prod",
        price: 250.0,
        stock: 50,
        categoryId: cat.id,
        status: "ACTIVE"
      }
    });
    productId = prod.id;

    // 2. Register User
    const vRes = await request(app).post("/api/v1/auth/email/request-verification").send({
      email: "testmobile1@example.com"
    });

    const regRes = await request(app).post("/api/v1/auth/register").send({
      email: "testmobile1@example.com",
      password: "password123",
      name: "Tirunesh Dibaba",
      verificationCode: vRes.body.devVerificationCode
    });

    token = regRes.body.token;
    userId = regRes.body.user.id;

    // 3. Add to cart & place order
    await request(app)
      .post("/api/v1/cart/items")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId, quantity: 2, variantKey: "default" });

    const orderRes = await request(app)
      .post("/api/v1/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        shippingName: "Tirunesh Dibaba",
        shippingAddress: "Bole Medhanialem",
        shippingCity: "Addis Ababa",
        shippingZip: "1000",
        shippingCountry: "Ethiopia",
        paymentMethod: "MOBILE"
      });

    orderId = orderRes.body.id;
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  it("should create Telebirr mobile payment intent with USSD instructions", async () => {
    const res = await request(app)
      .post("/api/v1/payments/mobile-intent")
      .set("Authorization", `Bearer ${token}`)
      .send({
        orderId,
        provider: "telebirr",
        mobileNumber: "0911223344"
      });

    expect(res.status).toBe(200);
    expect(res.body.orderId).toBe(orderId);
    expect(res.body.provider).toBe("telebirr");
    expect(res.body.merchantCode).toBe("889922");
    expect(res.body.referenceCode).toBeDefined();
    expect(res.body.ussdPrompt).toContain("*127*1*889922*");
    expect(res.body.instructions).toContain("Telebirr");
  });

  it("should create CBE Birr mobile payment intent with account instructions", async () => {
    const res = await request(app)
      .post("/api/v1/payments/mobile-intent")
      .set("Authorization", `Bearer ${token}`)
      .send({
        orderId,
        provider: "cbebirr",
        mobileNumber: "0922334455"
      });

    expect(res.status).toBe(200);
    expect(res.body.orderId).toBe(orderId);
    expect(res.body.provider).toBe("cbebirr");
    expect(res.body.merchantCode).toBe("100029384756");
    expect(res.body.ussdPrompt).toContain("*847#");
  });

  it("should handle Telebirr webhook callback and transition order to PAID", async () => {
    const webhookRes = await request(app)
      .post("/webhooks/telebirr")
      .send({
        orderId,
        status: "SUCCESS",
        transactionNo: "TB-TX-TEST-778899",
        totalAmount: 500
      });

    expect(webhookRes.status).toBe(200);
    expect(webhookRes.body.code).toBe(0);

    // Verify order status
    const verifyRes = await request(app)
      .get(`/api/v1/payments/verify/${orderId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.isPaid).toBe(true);
    expect(verifyRes.body.paymentStatus).toBe("PAID");
    expect(verifyRes.body.status).toBe("PAID");
    expect(verifyRes.body.paymentReference).toBe("TB-TX-TEST-778899");
  });

  it("should stream authentic PDF invoice via GET /api/v1/orders/:id/invoice", async () => {
    const res = await request(app)
      .get(`/api/v1/orders/${orderId}/invoice`)
      .set("Authorization", `Bearer ${token}`)
      .buffer(true)
      .parse((res, callback) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => callback(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
    expect(res.headers["content-disposition"]).toContain("attachment; filename=");

    const pdfBuffer: Buffer = res.body;
    expect(pdfBuffer.toString("utf8", 0, 8)).toBe("%PDF-1.4");
    expect(pdfBuffer.toString("utf8")).toContain("MEBA SUPERMARKET");
    expect(pdfBuffer.toString("utf8")).toContain("Tirunesh Dibaba");
    expect(pdfBuffer.toString("utf8").trim().endsWith("%%EOF")).toBe(true);
  });
});
