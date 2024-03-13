import { Hono } from "hono";
import { deleteByFilename } from "./handlers/delete-by-filename";
import { query } from "./handlers/query/query";
import { deleteRepoDetails } from "./handlers/repo-details/delete";
import { getRepoDetails } from "./handlers/repo-details/get";
import { updateRepoDetails } from "./handlers/repo-details/update";
import { vectorizeFiles } from "./handlers/vectorize-files/vectorize-files";
import { ai } from "./middleware/ai";
import { auth } from "./middleware/auth";
import { dryRun } from "./middleware/dry-run";
import { embeddings } from "./middleware/embeddings";
import { kv } from "./middleware/kv";
import { logger } from "./middleware/logger";
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

// CRUD for the current hash. This is updated manually by the client when
// it has finished uploading the current diff
app.get("/repo_details", getRepoDetails);
app.put("/repo_details", updateRepoDetails);
app.delete("/repo_details", deleteRepoDetails);

export default app;
