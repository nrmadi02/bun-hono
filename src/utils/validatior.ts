import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type { z } from "zod";

export function validator<
	Target extends keyof ValidationTargets,
	Schema extends z.ZodSchema,
>(target: Target, schema: Schema) {
	return zValidator(target, schema, (result, c) => {
		if (!result.success) {
			return c.json(
				{
					success: false,
					message: `Invalid ${target} payload`,
					errors: result.error.issues.map((issue) => issue.message),
				},
				422,
			);
		}
	});
}
