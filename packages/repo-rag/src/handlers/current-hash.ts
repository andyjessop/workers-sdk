import type { Context } from "../types";

export async function currentHash(ctx: Context) {
	const { code, data } = await ctx.get("ConsistentKV").get("current_hash");

	return ctx.json({ data: data?.value ?? null }, { status: code });
}
