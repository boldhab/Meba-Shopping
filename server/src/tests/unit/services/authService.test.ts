jest.mock("../../../repositories/userRepository", () => ({
  userRepository: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updatePassword: jest.fn(),
  },
}));

const tokenStore = new Map<string, any>();
jest.mock("../../../prisma/client", () => ({
  prisma: {
    authToken: {
      upsert: jest.fn(async ({ create, update, where }: any) => {
        const item = { ...create, ...update, id: "token-1" };
        tokenStore.set(where.key, item);
        return item;
      }),
      findFirst: jest.fn(async ({ where }: any) => {
        return tokenStore.get(where.key) || null;
      }),
      deleteMany: jest.fn(async ({ where }: any) => {
        if (where?.key) tokenStore.delete(where.key);
        return { count: 1 };
      }),
      update: jest.fn(async ({ where, data }: any) => {
        const item = tokenStore.get(where.id);
        if (item) Object.assign(item, data);
        return item;
      }),
    },
  },
}));

jest.mock("../../../config/mailer", () => ({
  mailer: {
    sendVerificationCode: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetCode: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock("../../../config/env", () => ({
  env: {
    isProduction: false,
    googleClientId: "test-client-id",
    googleClientSecret: "test-client-secret",
    googleRedirectUri: "http://localhost:4000/api/v1/auth/google/callback",
    clientUrl: "http://localhost:3000",
  },
}));

jest.mock("../../../utils/generateToken", () => ({
  generateToken: jest.fn(() => "mock-token"),
  verifyToken: jest.fn(),
}));

jest.mock("../../../utils/hashPassword", () => ({
  hashPassword: jest.fn(async (value: string) => `hashed:${value}`),
  verifyPassword: jest.fn(async (plain: string, hash: string) => hash === `hashed:${plain}`),
}));

import { authService } from "../../../services/authService";
import { userRepository } from "../../../repositories/userRepository";
import { mailer } from "../../../config/mailer";

const mockUserRepository = userRepository as jest.Mocked<typeof userRepository>;
const mockMailer = mailer as jest.Mocked<typeof mailer>;

describe("authService unit tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sends an email verification code and exposes the dev code in development", async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null as any);

    const result = await authService.requestEmailVerification({ email: "new-user@example.com" });

    expect(result.message).toMatch(/verification code sent/i);
    expect(result.devVerificationCode).toBeDefined();
    expect(mockMailer.sendVerificationCode).toHaveBeenCalledWith("new-user@example.com", expect.any(String), expect.any(Number));
  });

  it("registers a user after a valid verification request", async () => {
    mockUserRepository.findByEmail.mockResolvedValueOnce(null as any).mockResolvedValueOnce(null as any);
    mockUserRepository.create.mockResolvedValue({ id: "user-1", email: "registered-user@example.com", role: "CUSTOMER" } as any);

    const verification = await authService.requestEmailVerification({ email: "registered-user@example.com" });
    const result = await authService.register({
      email: "registered-user@example.com",
      password: "password123",
      name: "New User",
      verificationCode: verification.devVerificationCode!,
    });

    expect(result.token).toBe("mock-token");
    expect(mockUserRepository.create).toHaveBeenCalled();
  });

  describe("changePassword", () => {
    it("rejects when current password is missing", async () => {
      await expect(
        authService.changePassword("user-1", { currentPassword: "", newPassword: "newpassword123" })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Current password is required.",
      });
    });

    it("rejects when new password is too short", async () => {
      await expect(
        authService.changePassword("user-1", { currentPassword: "oldpassword", newPassword: "short" })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "New password must be at least 8 characters long.",
      });
    });

    it("rejects when current password does not match", async () => {
      mockUserRepository.findById.mockResolvedValue({
        id: "user-1",
        passwordHash: "hashed:correct-old-password",
      } as any);

      await expect(
        authService.changePassword("user-1", { currentPassword: "wrong-password", newPassword: "newpassword123" })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Incorrect current password.",
      });
    });

    it("successfully updates password when credentials are valid", async () => {
      mockUserRepository.findById.mockResolvedValue({
        id: "user-1",
        passwordHash: "hashed:correct-old-password",
      } as any);
      mockUserRepository.updatePassword.mockResolvedValue({} as any);

      const result = await authService.changePassword("user-1", {
        currentPassword: "correct-old-password",
        newPassword: "newpassword123",
      });

      expect(result.message).toBe("Password updated successfully.");
      expect(mockUserRepository.updatePassword).toHaveBeenCalledWith("user-1", "hashed:newpassword123");
    });
  });
});
