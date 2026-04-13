import type { Role } from "@prisma/client";
import { userRepository } from "../repositories/userRepository";
import { ApiError } from "../utils/apiError";
import { generateToken } from "../utils/generateToken";
import { hashPassword, verifyPassword } from "../utils/hashPassword";

type RegisterInput = {
  name?: string;
  email: string;
  password: string;
  role?: Role;
};

type LoginInput = {
  email: string;
  password: string;
};

function sanitizeUser(user: { passwordHash: string } & Record<string, unknown>) {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export const authService = {
  async register(input: RegisterInput) {
    const existingUser = await userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ApiError(409, "An account with that email already exists.");
    }

    const passwordHash = await hashPassword(input.password);

    const user = await userRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role ?? "CUSTOMER"
    });

    const token = generateToken({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return {
      user: sanitizeUser(user),
      token
    };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);

    if (!user) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const token = generateToken({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return {
      user: sanitizeUser(user),
      token
    };
  },

  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found.");
    }

    return sanitizeUser(user);
  }
};
