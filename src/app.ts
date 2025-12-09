import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import createApp from "./lib/create-app";
import configureOpenAPI from "./lib/open-api";
import auth from "./routes/auth/auth.index";
import authPage from "./routes/auth/auth.page";
import test from "./routes/test/test.index";
import admin from "./routes/admin/admin.index";
import "./config/env";
import { prettyJSON } from "hono/pretty-json";
import { setupBullBoard } from "./lib/bull-board";
import { registerWorkerEmail } from "./tasks/email/tasker";

const app = createApp();
app.use(logger());
app.use(prettyJSON());
app.use("/api/*", cors());

// Serve static files from dist folder
app.use("/static/*", serveStatic({ root: "./" }));

configureOpenAPI(app);
setupBullBoard(app);

registerWorkerEmail();

const routes = [test, auth, admin] as const;
const pages = [authPage] as const;

routes.forEach((route) => {
	app.route("/api/v1", route);
});

pages.forEach((page) => {
	app.route("/", page);
});

export default app;
