import type { Context } from "../types";
import type { StatusCode } from "hono/utils/http-status";

export async function deleteByFilename(ctx: Context) {
	const body = (await ctx.req.json()) as { filename: string };

	if (!body?.filename) {
		return new Response("Missing filename", { status: 400 });
	}

	const { filename } = body;

	const { code, data, message, success } = await ctx
		.get("VectorDb")
		.deleteByFilename(filename);

	if (!success) {
		return ctx.json({ message }, code as StatusCode);
	}

	return ctx.json(
		{
			data,
			message,
		},
		code as StatusCode
	);
}
