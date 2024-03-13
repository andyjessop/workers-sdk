import { Ai } from "@cloudflare/ai";
import { AnthropicMessages } from "../ai/AnthropicMessages";
import type { Context, Next } from "../types";

/**
 * Add an the KV store to the ctx object.
 */
export async function kv(ctx: Context, next: Next) {
	ctx.set("KV", ctx.env.WORKERS_SDK_RAG_KV);

	await next();
}
