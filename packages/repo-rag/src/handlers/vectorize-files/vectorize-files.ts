import type { Context } from "../../types";

interface FileData {
	filename: string;
	content: string;
}

export async function vectorizeFiles(ctx: Context) {
	const body = (await ctx.req.json()) as FileData[];

	if (!Array.isArray(body) || body.length === 0) {
		return ctx.json("Missing file data", { status: 400 });
	}

	const vectorDb = ctx.get("VectorDb");
	const isDryRun = ctx.get("isDryRun");
	const results = [];

	for (const { filename, content } of body) {
		if (!filename || !content) {
			results.push({
				filename,
				code: 400,
				success: false,
				message: "Missing content or filename",
			});
			continue;
		}

		const { code, data, message, success } = await vectorDb.upsert(
			content,
			filename
		);

		results.push({
			filename,
			code,
			data,
			message,
			success,
		});
	}

	return ctx.json(
		{
			data: results,
			message: isDryRun
				? "[Dry run: no data modified] Upsert successful."
				: "Upsert successful.",
		},
		200
	);
}
