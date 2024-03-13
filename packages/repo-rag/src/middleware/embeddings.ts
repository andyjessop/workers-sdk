import { Embeddings } from "../embeddings/Embeddings";
import type { Context, Next } from "../types";

/**
 * Add an Embeddings service to the ctx object.
 */
export async function embeddings(ctx: Context, next: Next) {
	const isDryRun = ctx.get("isDryRun");
	const logger = ctx.get("Logger");

	const embeddings = new Embeddings(ctx.env.OPENAI_API_KEY, logger, isDryRun);

	ctx.set("Embeddings", embeddings);

	await next();
}
