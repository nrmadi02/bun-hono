import { createRoute } from "@hono/zod-openapi";
import { errorResponseOpenAPIObjectConfig } from "../../lib/open-api";
import {
	loginSchema,
	registerSchema,
} from "../../schemas/auth/auth.schema";
import {
	loginResponseSchema,
	logoutResponseSchema,
	registerResponseSchema,
	sessionsResponseSchema,
} from "../../schemas/auth/auth-response.schema";
import { baseResponseSchema } from "../../schemas/base.schema";
import { validateToken } from "../../middlewares/auth.middleware";

export const loginRoutes = createRoute({
	path: "/auth/login",
	method: "post",
	tags: ["Auth"],
	description: "Login to the system",
	request: {
		body: {
			content: {
				"application/json": {
					schema: loginSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "Login successful",
			content: {
				"application/json": {
					schema: baseResponseSchema(loginResponseSchema),
				},
			},
		},
		400: errorResponseOpenAPIObjectConfig("Error logging in"),
		422: errorResponseOpenAPIObjectConfig("The validation error(s)"),
		404: errorResponseOpenAPIObjectConfig("User not found"),
		500: errorResponseOpenAPIObjectConfig("Internal server error"),
	},
});

export const registerRoutes = createRoute({
	path: "/auth/register",
	method: "post",
	tags: ["Auth"],
	description: "Register a new user",
	request: {
		body: {
			content: {
				"application/json": {
					schema: registerSchema,
				},
			},
		},
	},
	responses: {
		200: {
			description: "Register successful",
			content: {
				"application/json": {
					schema: baseResponseSchema(registerResponseSchema),
				},
			},
		},
		400: errorResponseOpenAPIObjectConfig("Error registering user"),
		422: errorResponseOpenAPIObjectConfig("The validation error(s)"),
		500: errorResponseOpenAPIObjectConfig("Internal server error"),
	},
});

export const logoutRoutes = createRoute({
	path: "/auth/logout",
	method: "post",
	tags: ["Auth"],
	description: "Logout from current session or specific device",
	security: [{ Bearer: [] }],
	responses: {
		200: {
			description: "Logout successful",
			content: {
				"application/json": {
					schema: baseResponseSchema(logoutResponseSchema),
				},
			},
		},
		401: errorResponseOpenAPIObjectConfig("Unauthorized"),
		404: errorResponseOpenAPIObjectConfig("Session not found"),
		500: errorResponseOpenAPIObjectConfig("Internal server error"),
	},
	middleware: [validateToken],
});

export const getSessionsRoutes = createRoute({
	path: "/auth/sessions",
	method: "get",
	tags: ["Auth"],
	description: "Get all active sessions for current user",
	security: [{ Bearer: [] }],
	responses: {
		200: {
			description: "Sessions retrieved successfully",
			content: {
				"application/json": {
					schema: baseResponseSchema(sessionsResponseSchema),
				},
			},
		},
		401: errorResponseOpenAPIObjectConfig("Unauthorized"),
		500: errorResponseOpenAPIObjectConfig("Internal server error"),
	},
	middleware: [validateToken],
});

export type LoginRoutes = typeof loginRoutes;
export type RegisterRoutes = typeof registerRoutes;
export type LogoutRoutes = typeof logoutRoutes;
export type GetSessionsRoutes = typeof getSessionsRoutes;
