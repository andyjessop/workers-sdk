import { StatusCode } from "hono/utils/http-status";
import type { Context } from "../types";

export async function listVectors(ctx: Context) {
	const consistentKv = ctx.get("ConsistentKV");
	const { code, data, message, success } = await consistentKv.list();

	if (!success) {
		return ctx.json({ message }, code as StatusCode);
	}

	return ctx.json({ data, message }, code as StatusCode);
}
