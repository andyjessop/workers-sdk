import { Ai } from "@cloudflare/ai";
import { AnthropicMessages } from "../ai/AnthropicMessages";
import type { Context, Next } from "../types";

/**
 * Add an Ai service to the ctx object.
 */
export async function ai(ctx: Context, next: Next) {
	const logger = ctx.get("Logger");
	const ai = new AnthropicMessages(ctx.env.ANTHROPIC_API_KEY, logger, {
		model: "claude-3-opus-20240229",
	});

	ctx.set("Ai", ai);

	await next();
}
