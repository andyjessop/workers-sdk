import type { Context, Next } from "../types";

/**
 * Authenticates by checking the WORKERS_SDK_RAG_API_KEY header, which is saved
 * as a secret for the Worker via the Cloudflare UI.
 */
export async function auth(ctx: Context, next: Next) {
	const { req, env } = ctx;

	if (req.header("WORKERS_SDK_RAG_API_KEY") !== env.WORKERS_SDK_RAG_API_KEY) {
		return new Response("Unauthorized", { status: 401 });
	}
	await next();
}
