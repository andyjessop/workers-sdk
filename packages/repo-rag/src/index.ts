import { Hono } from "hono";
import { deleteByFilename } from "./handlers/delete-by-filename";
import { query } from "./handlers/query/query";
import { deleteRepo } from "./handlers/repo/delete";
import { getRepo } from "./handlers/repo/get";
import { updateRepo } from "./handlers/repo/update";
import { githubWebhookHandler } from "./handlers/repo/webhooks/github/handler";
import { githubWebhookVerificationMiddleware } from "./handlers/repo/webhooks/github/verification-middleware";
import { vectorizeFiles } from "./handlers/vectorize-files/vectorize-files";
import { ai } from "./middleware/ai";
import { auth } from "./middleware/auth";
import { dryRun } from "./middleware/dry-run";
import { embeddings } from "./middleware/embeddings";
import { kv } from "./middleware/kv";
import { logger } from "./middleware/logger";
import { repo } from "./middleware/repo";
import { vectorDb } from "./middleware/vector-db";
import type { Env, Variables } from "./types";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Log to the console
app.use(logger);

// Checks for WORKERS_SDK_RAG_API_KEY
app.use(auth);

// Add some values and services to the ctx object
app.use(kv);
app.use(dryRun);
app.use(ai);
app.use(embeddings);
app.use(vectorDb);

// Takes a file and turns it into vectors, saving the vectors in the index
// This will split the file up into multiple chunks if deemed too big
// to retain context.
app.post("/vectors", vectorizeFiles);

// This route is questionable. Not sure if app.delete("/vectors/:filename")
// makes sense either, because we're potentially deleting multiple vectors.
app.post("/vectors/delete_by_filename", deleteByFilename);

// Query the AI. This will vectorize the query and then retrieve relevant
// snippets from the index, and use those as context for the query.
app.post("/vectors/query", query);

app.get("/repo/:owner/:name", repo, getRepo);
app.put("/repo/:owner/:name", repo, updateRepo);
app.delete("/repo/:owner/:name", repo, deleteRepo);
app.post(
	"/repo/:owner/:name/webhooks/github",
	githubWebhookVerificationMiddleware,
	repo,
	githubWebhookHandler
);

export default app;
