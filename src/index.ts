import { serve } from "bun";
import app from "./app";

const port = process.env.PORT || 3000;

console.log(`Server running on port ${port}`);

serve({ fetch: app.fetch, port });
