import { Hono } from "hono";
import { vectorizeFile } from "./handlers/create-vectors/create-vectors";
import { deleteByFilename } from "./handlers/delete-by-filename";
import { query } from "./handlers/query/query";
import { auth } from "./middleware/auth";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

// Checks for WORKERS_SDK_RAG_API_KEY
app.use(auth);

// Takes a file and turns it into vectors, saving the vectors in the index
// This will split the file up into multiple chunks if deemed too big
// to retain context.
app.post("/vectors", vectorizeFile);

// This route is questionable. Not sure if app.delete("/vectors/:filename")
// makes sense either, because we're potentially deleting multiple vectors.
app.post("/vectors/delete_by_filename", deleteByFilename);

// Query the AI. This will vectorize the query and then retrieve relevant
// snippets from the index, and use those as context for the query.
app.post("/query", query);

export default app;
