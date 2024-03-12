import { ConsistentKV } from "../storage/ConsistentKV";
import type { Context, Next } from "../types";

/**
 * Uses a durable object as a singleton to provide a KV store
 * that is consistent (Cloudflare KV is only "eventually" consistent)
 */
export async function consistentKv(ctx: Context, next: Next) {
	const isDryRun = ctx.get("isDryRun");

	const durableObject = ctx.env.WORKERS_SDK_CONSISTENT_KV.get(
		ctx.env.WORKERS_SDK_CONSISTENT_KV.idFromName("singleton")
	);

	ctx.set("ConsistentKV", new ConsistentKV(durableObject, isDryRun));

	await next();
}
