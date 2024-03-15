import { Repo } from "../repo/Repo";
import type { Context, Next } from "../types";

/**
 * Add the RepoDetails class to the ctx object.
 */
export async function repo(ctx: Context, next: Next) {
	const kv = ctx.get("KV");
	const logger = ctx.get("Logger");

	// get owner and name params from the request
	const owner = ctx.req.param("owner");
	const name = ctx.req.param("name");

	ctx.set("Repo", new Repo(kv, logger, owner, name));

	await next();
}
