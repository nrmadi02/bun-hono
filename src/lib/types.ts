import type { RouteConfig, RouteHandler, z } from "@hono/zod-openapi";
import type { AuthVariables } from "./create-app";

export type ZodSchema = z.ZodUnion | z.ZodObject | z.ZodArray<z.ZodObject>;
export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AuthVariables>;
