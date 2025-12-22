/**
 * Rate Limiter Middleware
 * Protects API from abuse and brute force attacks
 * Uses Redis store for production (multi-server support)
 */

import { rateLimiter } from "hono-rate-limiter";
import type { Context } from "hono";
import { connection } from "../lib/queue";
import { createRedisStore } from "../lib/rate-limit-redis-store";

/**
 * Get client identifier for rate limiting
 * Priority: x-forwarded-for > x-real-ip > connection remote address
 */
const getClientIdentifier = (c: Context) => {
	// Try to get real IP from headers (for reverse proxy/load balancer)
	const forwardedFor = c.req.header("x-forwarded-for");
	if (forwardedFor) {
		// x-forwarded-for can contain multiple IPs, take the first one
		return forwardedFor.split(",")[0].trim();
	}

	const realIp = c.req.header("x-real-ip");
	if (realIp) {
		return realIp;
	}

	// Fallback to connection info (if available)
	return c.req.header("cf-connecting-ip") || "unknown";
};

/**
 * General API rate limiter
 * Applies to all API routes
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimiter({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // max 100 requests per windowMs
	standardHeaders: "draft-6", // Return rate limit info in headers
	keyGenerator: getClientIdentifier,
	store: createRedisStore({
		client: connection,
		prefix: "rl:api:",
		windowMs: 15 * 60 * 1000,
	}),
	message: {
		success: false,
		message: "Too many requests from this IP, please try again later",
		errors: ["Rate limit exceeded. Please try again in a few minutes."],
	},
});

/**
 * Strict rate limiter for authentication endpoints
 * Prevents brute force attacks on login/register
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimiter({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 5, // max 5 attempts
	standardHeaders: "draft-6",
	keyGenerator: getClientIdentifier,
	store: createRedisStore({
		client: connection,
		prefix: "rl:auth:",
		windowMs: 15 * 60 * 1000,
	}),
	message: {
		success: false,
		message: "Too many authentication attempts, please try again later",
		errors: [
			"Account temporarily locked due to multiple failed attempts. Please try again in 15 minutes.",
		],
	},
});

/**
 * Password reset rate limiter
 * Prevents abuse of password reset functionality
 * 3 requests per hour per IP
 */
export const passwordResetLimiter = rateLimiter({
	windowMs: 60 * 60 * 1000, // 1 hour
	limit: 3, // max 3 attempts
	standardHeaders: "draft-6",
	keyGenerator: getClientIdentifier,
	store: createRedisStore({
		client: connection,
		prefix: "rl:pwd:",
		windowMs: 60 * 60 * 1000,
	}),
	message: {
		success: false,
		message: "Too many password reset attempts",
		errors: ["You have exceeded the password reset limit. Please try again in 1 hour."],
	},
});

/**
 * Admin operations rate limiter
 * More lenient for admin operations but still protected
 * 200 requests per 15 minutes per IP
 */
export const adminLimiter = rateLimiter({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 200, // max 200 requests
	standardHeaders: "draft-6",
	keyGenerator: getClientIdentifier,
	store: createRedisStore({
		client: connection,
		prefix: "rl:admin:",
		windowMs: 15 * 60 * 1000,
	}),
	message: {
		success: false,
		message: "Too many admin requests",
		errors: ["Admin rate limit exceeded. Please try again later."],
	},
});

/**
 * Email sending rate limiter
 * Prevents email spam
 * 10 emails per hour per IP
 */
export const emailLimiter = rateLimiter({
	windowMs: 60 * 60 * 1000, // 1 hour
	limit: 10, // max 10 emails
	standardHeaders: "draft-6",
	keyGenerator: getClientIdentifier,
	store: createRedisStore({
		client: connection,
		prefix: "rl:email:",
		windowMs: 60 * 60 * 1000,
	}),
	message: {
		success: false,
		message: "Too many email requests",
		errors: ["Email sending limit exceeded. Please try again in 1 hour."],
	},
});

/**
 * Heavy operation rate limiter
 * For computationally expensive operations
 * 10 requests per minute per IP
 */
export const heavyOperationLimiter = rateLimiter({
	windowMs: 60 * 1000, // 1 minute
	limit: 10, // max 10 requests
	standardHeaders: "draft-6",
	keyGenerator: getClientIdentifier,
	store: createRedisStore({
		client: connection,
		prefix: "rl:heavy:",
		windowMs: 60 * 1000,
	}),
	message: {
		success: false,
		message: "Too many requests for this operation",
		errors: ["Operation rate limit exceeded. Please try again in a minute."],
	},
});

