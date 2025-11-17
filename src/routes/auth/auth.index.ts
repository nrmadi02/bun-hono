import { createRouter } from "../../lib/create-app";
import * as handlers from "./auth.handlers";
import * as routes from "./auth.routes";

const router = createRouter()
	.openapi(routes.registerRoutes, handlers.registerHandler)
	.openapi(routes.loginRoutes, handlers.loginHandler)
	.openapi(routes.logoutRoutes, handlers.logoutHandler)
	.openapi(routes.getSessionsRoutes, handlers.getSessionsHandler)
	.openapi(routes.getMeRoutes, handlers.getMeHandler)
	.openapi(routes.forgotPasswordRoutes, handlers.forgotPasswordHandler)
	.openapi(routes.resetPasswordRoutes, handlers.resetPasswordHandler);

export default router;
