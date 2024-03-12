import { Ai } from "@cloudflare/ai";
import { VectorDb } from "../vectorize/VectorDb";
import type { Context, Next } from "../types";

/**
 * Add a VectorDb instance to the ctx object
 */
export async function vectorDb(ctx: Context, next: Next) {
	const ai = new Ai(ctx.env.WORKERS_SDK_RAG_AI);
	const consistentKv = ctx.get("ConsistentKV");
	const isDryRun = ctx.get("isDryRun");
	const db = ctx.env.WORKERS_SDK_RAG_INDEX;

	ctx.set("VectorDb", new VectorDb(ai, db, consistentKv, isDryRun));

	await next();
}
