import type { Context } from "../../types";

interface FileData {
	filename: string;
	content: string;
	overwrite: boolean;
}

export async function vectorizeFiles(ctx: Context) {
	const vectorDb = ctx.get("VectorDb");
	const isDryRun = ctx.get("isDryRun");
	const embeddings = ctx.get("Embeddings");
	const logger = ctx.get("Logger");

	const body = (await ctx.req.json()) as FileData[];

	if (!Array.isArray(body) || body.length === 0) {
		return ctx.json("Missing file data", { status: 400 });
	}

	const results = [];

	for (const { filename, content, overwrite } of body) {
		if (!filename || !content) {
			results.push({
				filename,
				code: 400,
				success: false,
				message: "Missing content or filename",
			});

			continue;
		}

		if (overwrite === false) {
			const exists = await vectorDb.exists(filename);

			if (exists) {
				const message = `Vector already exists for filename: ${filename}`;

				logger.info(message);

				results.push({
					filename,
					code: 400,
					success: false,
					message,
				});

				continue;
			}
		}

		const {
			code: embeddingsCode,
			data: embeddingsData,
			message: embeddingsMessage,
			success: embeddingsSuccess,
		} = await embeddings.createEmbeddings(filename, content);

		if (!embeddingsSuccess) {
			results.push({
				filename,
				code: embeddingsCode,
				success: false,
				message: embeddingsMessage,
			});

			continue;
		}

		const { code, data, message, success } = await vectorDb.upsert(
			filename,
			embeddingsData
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
