import { createRouter } from "../../lib/create-app";
import * as handlers from "./test.handlers";
import * as routes from "./test.routes";

const router = createRouter().openapi(routes.test, handlers.test);

export default router;
