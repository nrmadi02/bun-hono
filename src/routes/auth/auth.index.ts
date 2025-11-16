import { createRouter } from "../../lib/create-app";
import * as handlers from "./auth.handlers";
import * as routes from "./auth.routes";

const router = createRouter()
	.openapi(routes.registerRoutes, handlers.registerHandler)
	.openapi(routes.loginRoutes, handlers.loginHandler)
	.openapi(routes.logoutRoutes, handlers.logoutHandler)
	.openapi(routes.getSessionsRoutes, handlers.getSessionsHandler);

export default router;
