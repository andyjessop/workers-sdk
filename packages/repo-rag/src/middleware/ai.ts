import { Ai } from "@cloudflare/ai";
import type { Context, Next } from "../types";

/**
 * Add an Ai service to the ctx object.
 */
export async function ai(ctx: Context, next: Next) {
	const service = new Ai(ctx.env.WORKERS_SDK_RAG_AI);

	ctx.set("Ai", service);

	await next();
}
