import request from "supertest";
import { createApp } from "../../app";
import { prisma } from "../../prisma/client";

const app = createApp();

describe("Auth Integration Tests", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: "testauth" } } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { contains: "testauth" } } });
    await prisma.$disconnect();
  });

  it("should register a new user successfully", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "testauth1@example.com",
      password: "password123",
      name: "Test Auth"
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("testauth1@example.com");
  });

  it("should login successfully with correct credentials", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "testauth1@example.com",
      password: "password123"
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("should fail login with wrong password", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: "testauth1@example.com",
      password: "wrongpassword"
    });

    expect(res.status).toBe(401);
  });
});
