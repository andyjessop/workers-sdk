import type { Context } from "../types";

export async function deleteByFilename(ctx: Context) {
	const body = (await ctx.req.json()) as { filenames: string[] };
	const isDryRun = ctx.get("isDryRun");

	if (!body?.filenames) {
		return new Response("Missing filenames array", { status: 400 });
	}

	const { filenames } = body;

	const deletedFiles = [];
	const failedFiles = [];

	for (const filename of filenames) {
		const { success } = await ctx.get("VectorDb").deleteByFilename(filename);

		if (success) {
			deletedFiles.push(filename);
		} else {
			failedFiles.push(filename);
		}
	}

	return ctx.json(
		{
			data: {
				deletedFiles,
				failedFiles,
			},
			message: isDryRun
				? "[Dry run: no data modified] Delete successful."
				: "Delete successful.",
		},
		200
	);
}
