import type { Context } from "../types";

export async function deleteByFilename(ctx: Context) {
	const body = (await ctx.req.json()) as { filenames: string[] };
	const isDryRun = ctx.get("isDryRun");

	if (!body?.filenames) {
		return new Response("Missing filenames array", { status: 400 });
	}

	const { filenames } = body;

	const results = [];

	for (const filename of filenames) {
		const { code, data, message, success } = await ctx
			.get("VectorDb")
			.deleteByFilename(filename);

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
				? "[Dry run: no data modified] Delete successful."
				: "Delete successful.",
		},
		200
	);
}
