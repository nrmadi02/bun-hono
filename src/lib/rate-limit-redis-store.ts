/**
 * Redis Store for Rate Limiter
 * Provides shared rate limiting across multiple server instances
 */

import type { Redis } from "ioredis";

export interface RateLimitStore {
	increment: (key: string) => Promise<{ totalHits: number; resetTime: Date | undefined }>;
	decrement: (key: string) => Promise<void>;
	resetKey: (key: string) => Promise<void>;
}

export interface RedisStoreOptions {
	client: Redis;
	prefix?: string;
	windowMs?: number;
}

/**
 * Redis-based rate limit store
 * Shared across all server instances
 * Persists rate limit data in Redis
 */
export class RedisRateLimitStore implements RateLimitStore {
	public client: Redis;
	public prefix: string;
	public windowMs: number;

	constructor(options: RedisStoreOptions) {
		this.client = options.client;
		this.prefix = options.prefix || "rl:";
		this.windowMs = options.windowMs || 60000;
	}

	async increment(key: string): Promise<{ totalHits: number; resetTime: Date | undefined }> {
		const redisKey = `${this.prefix}${key}`;

		// Use Redis MULTI for atomic operations
		const pipeline = this.client.pipeline();
		pipeline.incr(redisKey);
		pipeline.pttl(redisKey);

		const results = await pipeline.exec();

		if (!results) {
			throw new Error("Redis pipeline failed");
		}

		const [[incrErr, totalHits], [ttlErr, ttl]] = results as [
			[Error | null, number],
			[Error | null, number],
		];

		if (incrErr) throw incrErr;
		if (ttlErr) throw ttlErr;

		// If this is the first request or key has no TTL, set expiration
		if (ttl === -1 || ttl === -2) {
			await this.client.pexpire(redisKey, this.windowMs);
		}

		// Calculate reset time
		const resetTime = ttl > 0 ? new Date(Date.now() + ttl) : new Date(Date.now() + this.windowMs);

		return {
			totalHits: totalHits as number,
			resetTime,
		};
	}

	async decrement(key: string): Promise<void> {
		const redisKey = `${this.prefix}${key}`;
		const current = await this.client.get(redisKey);

		if (current && Number.parseInt(current) > 0) {
			await this.client.decr(redisKey);
		}
	}

	async resetKey(key: string): Promise<void> {
		const redisKey = `${this.prefix}${key}`;
		await this.client.del(redisKey);
	}
}

/**
 * Create Redis store for rate limiter
 */
export const createRedisStore = (options: RedisStoreOptions): RedisRateLimitStore => {
	return new RedisRateLimitStore(options);
};

