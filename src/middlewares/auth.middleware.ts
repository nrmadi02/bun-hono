import { verify } from "hono/jwt";

import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { env } from "../config/env";
import prisma from "prisma";
import { errorResponse } from "../utils/response";

export const validateToken =createMiddleware<{
  Variables: {
    userId: string
    token: string
  }
}> (async (
	c: Context,
  next: Next
) => {
	const authHeader = c.req.header("Authorization");
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return errorResponse(c, "Unauthorized - No token provided", ["Unauthorized - No token provided"], 401);
	}

	const token = authHeader.substring(7);
	const secret = env.JWT_SECRET;

	const findToken = await prisma.session.findUnique({
		where: { sessionToken: token },
	});

	if (!findToken) {
		return errorResponse(c, "Unauthorized - Invalid token", ["Unauthorized - Invalid token"], 401);
	}

	if (findToken.expireAt < new Date()) {
		return errorResponse(c, "Unauthorized - Token expired", ["Unauthorized - Token expired"], 401);
	}

	try {
		const payload = await verify(token, secret, "HS256");
		c.set("userId", payload.id as string);
		c.set("token", token);
		await next();
	} catch {
		return errorResponse(c, "Unauthorized - Invalid token", ["Unauthorized - Invalid token"], 401);
	}
});