import { prisma } from "../prisma/client";

export async function connectDatabase() {
  await prisma.$connect();
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export const database = {
  client: prisma
};
