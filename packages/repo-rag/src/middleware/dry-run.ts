import type { Context, Next } from "../types";

/**
 * Dry runs do not change any state, either in the durable objects,
 * or in the vector DB.
 */
export async function dryRun(ctx: Context, next: Next) {
	const isDryRun = Boolean(ctx.req.queries("dry-run"));

	ctx.set("isDryRun", isDryRun);

	await next();
}
