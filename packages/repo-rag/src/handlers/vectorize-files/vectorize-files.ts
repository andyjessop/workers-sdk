import type { Context } from "../../types";
import type { StatusCode } from "hono/utils/http-status";

export async function vectorizeFiles(ctx: Context) {
	const body = (await ctx.req.json()) as {
		content: string;
		filename: string;
	};

	if (!body?.content || !body?.filename) {
		return ctx.json("Missing content or filename", { status: 400 });
	}

	const { content, filename } = body;
	const vectorDb = ctx.get("VectorDb");

	const { code, data, message, success } = await vectorDb.upsert(
		content,
		filename
	);

	if (!success) {
		return ctx.json(message, code as StatusCode);
	}

	return ctx.json(
		{
			data,
			message,
		},
		code as StatusCode
	);
}
