import net from "node:net";
import { logger } from "./logger";

export interface ICacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string | string[]): Promise<number>;
  delByPattern(pattern: string): Promise<number>;
  rpush(key: string, ...values: string[]): Promise<number>;
  lpop(key: string): Promise<string | null>;
  llen(key: string): Promise<number>;
  flushAll(): Promise<void>;
  isRedisActive(): boolean;
  disconnect(): Promise<void>;
}

class InMemoryCacheStore implements ICacheStore {
  private store = new Map<string, { value: string; expiresAt?: number }>();
  private lists = new Map<string, string[]>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.evictExpired();
    }, 30_000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  private evictExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (item.expiresAt && item.expiresAt <= now) {
        this.store.delete(key);
      }
    }
  }

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && item.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async del(key: string | string[]): Promise<number> {
    const keys = Array.isArray(key) ? key : [key];
    let count = 0;
    for (const k of keys) {
      if (this.store.delete(k)) count++;
      if (this.lists.delete(k)) count++;
    }
    return count;
  }

  async delByPattern(pattern: string): Promise<number> {
    // Converts Redis wildcards (e.g. "products:*") to RegExp
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
    const regex = new RegExp(`^${escaped}$`);
    let count = 0;

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
        count++;
      }
    }

    for (const key of this.lists.keys()) {
      if (regex.test(key)) {
        this.lists.delete(key);
        count++;
      }
    }

    return count;
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    let list = this.lists.get(key);
    if (!list) {
      list = [];
      this.lists.set(key, list);
    }
    list.push(...values);
    return list.length;
  }

  async lpop(key: string): Promise<string | null> {
    const list = this.lists.get(key);
    if (!list || list.length === 0) return null;
    const item = list.shift() ?? null;
    return item;
  }

  async llen(key: string): Promise<number> {
    const list = this.lists.get(key);
    return list ? list.length : 0;
  }

  async flushAll(): Promise<void> {
    this.store.clear();
    this.lists.clear();
  }

  isRedisActive(): boolean {
    return false;
  }

  async disconnect(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
    this.lists.clear();
  }
}

/**
 * Minimal zero-dependency RESP client over node:net.
 * Connects to Redis when available; falls back to InMemoryCacheStore gracefully.
 */
class RedisHybridClient implements ICacheStore {
  private inMemory = new InMemoryCacheStore();
  private socket: net.Socket | null = null;
  private isConnected = false;
  private connecting = false;
  private redisUrl: string;
  private host = "localhost";
  private port = 6379;
  private commandQueue: Array<{
    resolve: (val: any) => void;
    reject: (err: any) => void;
    cmd: string;
  }> = [];
  private receiveBuffer = "";

  constructor(url?: string) {
    this.redisUrl = url || process.env.REDIS_URL || "redis://localhost:6379";
    this.parseUrl();
    this.initRedis();
  }

  private parseUrl() {
    try {
      const u = new URL(this.redisUrl);
      this.host = u.hostname || "localhost";
      this.port = parseInt(u.port || "6379", 10);
    } catch {
      this.host = "localhost";
      this.port = 6379;
    }
  }

  private initRedis() {
    if (this.connecting || this.isConnected) return;
    this.connecting = true;

    try {
      const client = net.createConnection({ host: this.host, port: this.port, timeout: 1500 }, () => {
        this.isConnected = true;
        this.connecting = false;
        this.socket = client;
        if (client.unref) client.unref();
        logger.info(`[CacheStore] Connected to Redis instance at ${this.host}:${this.port}`);
      });
      if (client.unref) client.unref();

      client.on("data", (chunk) => {
        this.receiveBuffer += chunk.toString();
        this.processBuffer();
      });

      client.on("error", () => {
        this.fallbackToMemory();
      });

      client.on("timeout", () => {
        client.destroy();
        this.fallbackToMemory();
      });

      client.on("close", () => {
        this.fallbackToMemory();
      });
    } catch {
      this.fallbackToMemory();
    }
  }

  private fallbackToMemory() {
    if (this.isConnected) {
      logger.warn(`[CacheStore] Redis connection lost. Falling back to in-memory TTL store.`);
    }
    this.isConnected = false;
    this.connecting = false;
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    // Reject any pending queued socket commands so callers fallback or don't hang
    while (this.commandQueue.length > 0) {
      const pending = this.commandQueue.shift();
      pending?.reject(new Error("Redis socket unavailable"));
    }
  }

  private processBuffer() {
    while (this.receiveBuffer.length > 0 && this.commandQueue.length > 0) {
      const parsed = this.parseRespResponse(this.receiveBuffer);
      if (!parsed) break; // Incomplete response

      this.receiveBuffer = this.receiveBuffer.slice(parsed.bytesConsumed);
      const pending = this.commandQueue.shift();
      if (pending) {
        if (parsed.isError) {
          pending.reject(new Error(parsed.value));
        } else {
          pending.resolve(parsed.value);
        }
      }
    }
  }

  private parseRespResponse(buf: string): { value: any; bytesConsumed: number; isError: boolean } | null {
    if (!buf) return null;
    const prefix = buf[0];
    const newlineIdx = buf.indexOf("\r\n");
    if (newlineIdx === -1) return null;

    if (prefix === "+") {
      // Simple string
      return {
        value: buf.slice(1, newlineIdx),
        bytesConsumed: newlineIdx + 2,
        isError: false,
      };
    }
    if (prefix === "-") {
      // Error
      return {
        value: buf.slice(1, newlineIdx),
        bytesConsumed: newlineIdx + 2,
        isError: true,
      };
    }
    if (prefix === ":") {
      // Integer
      return {
        value: parseInt(buf.slice(1, newlineIdx), 10),
        bytesConsumed: newlineIdx + 2,
        isError: false,
      };
    }
    if (prefix === "$") {
      // Bulk string
      const len = parseInt(buf.slice(1, newlineIdx), 10);
      if (len === -1) {
        return { value: null, bytesConsumed: newlineIdx + 2, isError: false };
      }
      const dataStart = newlineIdx + 2;
      const dataEnd = dataStart + len;
      if (buf.length < dataEnd + 2) return null; // Incomplete
      const val = buf.slice(dataStart, dataEnd);
      return {
        value: val,
        bytesConsumed: dataEnd + 2,
        isError: false,
      };
    }

    if (prefix === "*") {
      // Array
      const count = parseInt(buf.slice(1, newlineIdx), 10);
      if (count === -1) return { value: null, bytesConsumed: newlineIdx + 2, isError: false };
      if (count === 0) return { value: [], bytesConsumed: newlineIdx + 2, isError: false };

      let currentOffset = newlineIdx + 2;
      const elements: any[] = [];
      for (let i = 0; i < count; i++) {
        const remaining = buf.slice(currentOffset);
        const sub = this.parseRespResponse(remaining);
        if (!sub) return null;
        elements.push(sub.value);
        currentOffset += sub.bytesConsumed;
      }
      return {
        value: elements,
        bytesConsumed: currentOffset,
        isError: false,
      };
    }

    return null;
  }

  private formatCommand(...args: (string | number)[]): string {
    let out = `*${args.length}\r\n`;
    for (const arg of args) {
      const str = String(arg);
      out += `$${Buffer.byteLength(str)}\r\n${str}\r\n`;
    }
    return out;
  }

  private sendCommand<T = any>(...args: (string | number)[]): Promise<T> {
    if (!this.isConnected || !this.socket) {
      return Promise.reject(new Error("Redis offline"));
    }

    return new Promise<T>((resolve, reject) => {
      const cmdStr = this.formatCommand(...args);
      this.commandQueue.push({ resolve, reject, cmd: String(args[0]) });
      this.socket!.write(cmdStr, (err) => {
        if (err) {
          this.fallbackToMemory();
          reject(err);
        }
      });
    });
  }

  isRedisActive(): boolean {
    return this.isConnected;
  }

  async get(key: string): Promise<string | null> {
    if (this.isConnected) {
      try {
        return await this.sendCommand<string | null>("GET", key);
      } catch {
        // Fall back to memory on socket error
      }
    }
    return this.inMemory.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    // Write through to memory always for fast local reads
    await this.inMemory.set(key, value, ttlSeconds);

    if (this.isConnected) {
      try {
        if (ttlSeconds && ttlSeconds > 0) {
          await this.sendCommand("SET", key, value, "EX", ttlSeconds);
        } else {
          await this.sendCommand("SET", key, value);
        }
      } catch {
        // Handled gracefully in memory
      }
    }
  }

  async del(key: string | string[]): Promise<number> {
    const keys = Array.isArray(key) ? key : [key];
    const memCount = await this.inMemory.del(keys);

    if (this.isConnected && keys.length > 0) {
      try {
        return await this.sendCommand<number>("DEL", ...keys);
      } catch {
        // Fallback
      }
    }
    return memCount;
  }

  async delByPattern(pattern: string): Promise<number> {
    const memCount = await this.inMemory.delByPattern(pattern);

    if (this.isConnected) {
      try {
        const keys = await this.sendCommand<string[]>("KEYS", pattern);
        if (Array.isArray(keys) && keys.length > 0) {
          await this.sendCommand("DEL", ...keys);
          return keys.length;
        }
        return 0;
      } catch {
        // Fallback
      }
    }
    return memCount;
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    if (this.isConnected && values.length > 0) {
      try {
        return await this.sendCommand<number>("RPUSH", key, ...values);
      } catch {
        // Fallback
      }
    }
    return this.inMemory.rpush(key, ...values);
  }

  async lpop(key: string): Promise<string | null> {
    if (this.isConnected) {
      try {
        return await this.sendCommand<string | null>("LPOP", key);
      } catch {
        // Fallback
      }
    }
    return this.inMemory.lpop(key);
  }

  async llen(key: string): Promise<number> {
    if (this.isConnected) {
      try {
        return await this.sendCommand<number>("LLEN", key);
      } catch {
        // Fallback
      }
    }
    return this.inMemory.llen(key);
  }

  async flushAll(): Promise<void> {
    await this.inMemory.flushAll();
    if (this.isConnected) {
      try {
        await this.sendCommand("FLUSHALL");
      } catch {
        // Fallback
      }
    }
  }

  async disconnect(): Promise<void> {
    await this.inMemory.disconnect();
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

export const cacheStore: ICacheStore = new RedisHybridClient();
export const redis = {
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
  client: cacheStore,
};
