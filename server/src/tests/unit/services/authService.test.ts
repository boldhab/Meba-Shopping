jest.mock("../../../repositories/userRepository", () => ({
  userRepository: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updatePassword: jest.fn(),
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
    mockUserRepository.create.mockResolvedValue({ id: "user-1", email: "new-user@example.com", role: "CUSTOMER" } as any);

    const verification = await authService.requestEmailVerification({ email: "new-user@example.com" });
    const result = await authService.register({
      email: "new-user@example.com",
      password: "password123",
      name: "New User",
      verificationCode: verification.devVerificationCode!,
    });

    expect(result.token).toBe("mock-token");
    expect(mockUserRepository.create).toHaveBeenCalled();
  });
});
