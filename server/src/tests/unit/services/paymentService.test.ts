import { prisma } from "../../../prisma/client";
import { inventoryService } from "../../../services/inventoryService";
import { emailService } from "../../../services/emailService";

// Shared mock methods across tests
const mockConstructEvent = jest.fn();
const mockRefundsCreate = jest.fn();
const mockPaymentIntentsCreate = jest.fn();

jest.mock("../../../prisma/client", () => ({
  prisma: {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("../../../services/inventoryService", () => ({
  inventoryService: {
    deductStockForOrder: jest.fn().mockResolvedValue(undefined),
    releaseStockForOrder: jest.fn().mockResolvedValue({ restoredCount: 1, mode: "reservation" }),
  },
}));

jest.mock("../../../services/emailService", () => ({
  emailService: {
    sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
    sendPaymentFailed: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("stripe", () => {
  return jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: (...args: any[]) => mockConstructEvent(...args),
    },
    refunds: {
      create: (...args: any[]) => mockRefundsCreate(...args),
    },
    paymentIntents: {
      create: (...args: any[]) => mockPaymentIntentsCreate(...args),
    },
  }));
});

// Import paymentService AFTER mocks are registered
import { paymentService } from "../../../services/paymentService";

describe("paymentService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("handleWebhook", () => {
    it("throws 500 ApiError if STRIPE_WEBHOOK_SECRET is not configured", async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      await expect(
        paymentService.handleWebhook("some-sig", Buffer.from("{}"))
      ).rejects.toMatchObject({
        statusCode: 500,
        message: "Stripe webhook secret is not configured on the server.",
      });
    });

    it("throws 400 ApiError if signature is missing", async () => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";

      await expect(
        paymentService.handleWebhook("", Buffer.from("{}"))
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Missing Stripe signature header.",
      });
    });

    it("throws 400 ApiError if Stripe signature verification fails", async () => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
      mockConstructEvent.mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      await expect(
        paymentService.handleWebhook("bad-sig", Buffer.from("{}"))
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("Invalid signature"),
      });
    });

    it("processes payment_intent.succeeded and finalizes order and stock", async () => {
      process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
      mockConstructEvent.mockReturnValue({
        type: "payment_intent.succeeded",
        data: {
          object: {
            metadata: { orderId: "order-123" },
          },
        },
      });

      (prisma.order.update as jest.Mock).mockResolvedValue({
        id: "order-123",
        status: "PAID",
        paymentStatus: "PAID",
        user: { email: "user@example.com" },
      });

      const result = await paymentService.handleWebhook("valid-sig", Buffer.from("{}"));

      expect(result).toEqual({ received: true });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: "order-123" },
        data: { paymentStatus: "PAID", status: "PAID" },
        include: { user: true },
      });
      expect(inventoryService.deductStockForOrder).toHaveBeenCalledWith("order-123");
      expect(emailService.sendOrderConfirmation).toHaveBeenCalled();
    });
  });

  describe("refundPayment", () => {
    it("calls stripeClient.refunds.create and returns the refund", async () => {
      mockRefundsCreate.mockResolvedValue({ id: "re_test_123", status: "succeeded" });

      const refund = await paymentService.refundPayment("pi_test_123");

      expect(mockRefundsCreate).toHaveBeenCalledWith({
        payment_intent: "pi_test_123",
      });
      expect(refund.id).toBe("re_test_123");
    });
  });
});
