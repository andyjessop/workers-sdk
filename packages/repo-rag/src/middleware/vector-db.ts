import { VectorDb } from "../vectorize/VectorDb";
import type { Context, Next } from "../types";

/**
 * Add a VectorDb instance to the ctx object
 */
export async function vectorDb(ctx: Context, next: Next) {
	const isDryRun = ctx.get("isDryRun");
	const embeddings = ctx.get("Embeddings");
	const logger = ctx.get("Logger");
	const db = ctx.env.WORKERS_SDK_RAG_INDEX;

	ctx.set("VectorDb", new VectorDb(db, embeddings, logger, isDryRun));

	await next();
}
