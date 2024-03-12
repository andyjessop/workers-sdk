import { Hono } from "hono";
import { currentHash } from "./handlers/current-hash";
import { deleteByFilename } from "./handlers/delete-by-filename";
import { listVectors } from "./handlers/list-vectors";
import { query } from "./handlers/query/query";
import { vectorizeFiles } from "./handlers/vectorize-files/vectorize-files";
import { ai } from "./middleware/ai";
import { auth } from "./middleware/auth";
import { consistentKv } from "./middleware/consistent-kv";
import { dryRun } from "./middleware/dry-run";
import { vectorDb } from "./middleware/vector-db";
import type { Env, Variables } from "./types";

export { ConsistentKVDO } from "./storage/ConsistentKVDO";

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Checks for WORKERS_SDK_RAG_API_KEY
app.use(auth);

// Add some values and services to the ctx object
app.use(dryRun);
app.use(ai);
app.use(consistentKv);
app.use(vectorDb);

app.get("/vectors", listVectors);

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

// The current hash is the commit hash of the last files to be saved to
// the vector DB.
app.get("/current_hash", currentHash);

export default app;
