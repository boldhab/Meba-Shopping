import express from "express";
import request from "supertest";
import { cacheMiddleware, invalidateCache } from "../../../middleware/cacheMiddleware";
import { cacheStore } from "../../../config/redis";

describe("Cache Middleware and Invalidation", () => {
  let app: express.Express;
  let hitCounter = 0;

  beforeEach(async () => {
    hitCounter = 0;
    await cacheStore.flushAll();

    app = express();
    app.use(express.json());

    const cacheHandler = cacheMiddleware({ ttlSeconds: 10, prefix: "test-cache" });

    app.get("/test-endpoint", cacheHandler, (_req, res) => {
      hitCounter++;
      res.json({ count: hitCounter, message: "computation result" });
    });
  });

  afterAll(async () => {
    await cacheStore.flushAll();
  });

  it("should return X-Cache: MISS on first access and cache the response", async () => {
    const res1 = await request(app).get("/test-endpoint");
    expect(res1.status).toBe(200);
    expect(res1.headers["x-cache"]).toBe("MISS");
    expect(res1.body.count).toBe(1);

    // Second access should hit cache
    const res2 = await request(app).get("/test-endpoint");
    expect(res2.status).toBe(200);
    expect(res2.headers["x-cache"]).toBe("HIT");
    expect(res2.body.count).toBe(1); // handler wasn't called again!
    expect(hitCounter).toBe(1);
  });

  it("should invalidate cache matching pattern and serve fresh MISS on next request", async () => {
    // Populate cache
    await request(app).get("/test-endpoint");
    expect(hitCounter).toBe(1);

    // Invalidate pattern
    await invalidateCache("test-cache:*");

    // Next request should be MISS and trigger handler
    const res = await request(app).get("/test-endpoint");
    expect(res.status).toBe(200);
    expect(res.headers["x-cache"]).toBe("MISS");
    expect(res.body.count).toBe(2);
    expect(hitCounter).toBe(2);
  });
});
