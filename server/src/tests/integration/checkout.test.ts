import request from "supertest";
import { createApp } from "../../app";
import { prisma } from "../../prisma/client";

const app = createApp();

// Mocking external services
jest.mock("../../services/paymentService", () => ({
  paymentService: {
    createPaymentIntent: jest.fn().mockResolvedValue({ clientSecret: "mock_secret_123" }),
    handleWebhook: jest.fn().mockResolvedValue({ received: true })
  }
}));

describe("Checkout & Payment Integration Tests", () => {
  let token: string;
  let orderId: string;

  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: "testchk" } } });
    
    // Register to get token
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "testchk1@example.com",
      password: "password123",
      name: "Test Checkout"
    });
    token = res.body.token;

    // Create a mock order to test payment intent
    const order = await prisma.order.create({
      data: {
        userId: res.body.user.id,
        totalAmount: 100.50,
        status: "PENDING",
        paymentStatus: "UNPAID"
      }
    });
    orderId = order.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: "testchk" } } });
    await prisma.$disconnect();
  });

  it("should create a payment intent for an unpaid order", async () => {
    const res = await request(app)
      .post("/api/v1/payments/create-intent")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId });

    // Assuming endpoint does not require Auth yet, or we passed valid auth.
    // If auth is required on payment routes, we sent the token.
    expect(res.status).toBe(200);
    expect(res.body.clientSecret).toBe("mock_secret_123");
  });

  it("should process stripe webhooks successfully", async () => {
    const res = await request(app)
      .post("/webhooks/stripe")
      .set("stripe-signature", "test-signature")
      .send({ type: "payment_intent.succeeded" });

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });
});
