import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import {
	baseResponseSchema,
	createErrorSchema,
	createMessageObjectSchema,
} from "../../schemas/base.schema";
import { validateToken } from "../../middlewares/auth.middleware";
import { casbinMiddleware } from "../../middlewares/casbin.middleware";

export const test = createRoute({
	path: "/test",
	method: "get",
	tags: ["Test"],
	responses: {
		200: {
			description: "Test route",
			content: {
				"application/json": {
					schema: baseResponseSchema(
						z.object({
							data: z.string(),
						}),
					),
				},
			},
		},
		404: {
			content: {
				"application/json": {
					schema: createMessageObjectSchema(),
				},
			},
			description: "User not found",
		},
		422: {
			content: {
				"application/json": {
					schema: createErrorSchema(),
				},
			},
			description: "The validation error(s)",
		},
	},
	middleware: [validateToken, casbinMiddleware("users", "update")],
});

export type TestRoute = typeof test;
