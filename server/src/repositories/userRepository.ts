import type { Prisma, Role } from "@prisma/client";
import { prisma } from "../prisma/client";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    });
  },
  findById(id: string) {
    return prisma.user.findUnique({
      where: { id }
    });
  },
  create(data: Prisma.UserCreateInput & { role?: Role }) {
    return prisma.user.create({
      data
    });
  },
  updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: { id },
      data: { passwordHash }
    });
  }
};
