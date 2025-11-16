import { OpenAPIHono } from "@hono/zod-openapi";

import { config } from "dotenv";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { ZodError } from "zod";

config();

export type AuthVariables = {
  Variables: {
    userId?: string
    token?: string
  }
}

const zodValidationHook = (errors: ZodError) => {
	return {
		message: "The validation error(s)",
		success: false,
		errors: errors.issues.map((err) => err.message),
	};
};

export function createRouter() {
	return new OpenAPIHono<AuthVariables>({
		strict: false,
		defaultHook: (result, c) => {
			if (!result.success) {
				return c.json(zodValidationHook(result.error), 422);
			}
		},
	});
}

export default function createApp() {
	const app = new OpenAPIHono<AuthVariables>({
		strict: false,
		defaultHook: (result, c) => {
			if (!result.success) {
				return c.json(zodValidationHook(result.error), 422);
			}
		},
	});

	app.notFound((c) => {
		return c.json(
			{ message: "Not found", success: false, errors: ["Not found"] },
			404,
		);
	});

	app.onError((err, c) => {
		const currentStatus =
			"status" in err ? err.status : c.newResponse(null).status;
		const statusCode =
			currentStatus !== "OK" ? (currentStatus as ContentfulStatusCode) : 500;

		console.error(err);

		const env = process.env.NODE_ENV;
		return c.json(
			{
				message: err.message,
				success: false,
				errors: [err.message],
				stack: env === "production" ? undefined : err.stack,
			},
			statusCode,
		);
	});

	return app;
}
