import { verify } from "hono/jwt";

import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";

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
		return c.json({
			message: "Unauthorized - No token provided",
			success: false,
			errors: ["Unauthorized - No token provided"],
		}, 401);
	}

	const token = authHeader.substring(7);
	const secret = process.env.JWT_SECRET ?? "";

	try {
		const payload = await verify(token, secret, "HS256");
		c.set("userId", payload.id as string);
		c.set("token", token);
		await next();
	} catch {
		return c.json({
			message: "Unauthorized - Invalid token",
			success: false,
			errors: ["Unauthorized - Invalid token"],
		}, 401);
	}
});