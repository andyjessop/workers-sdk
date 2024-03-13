import type { Context } from "../../types";

export async function getRepoDetails(ctx: Context) {
	const kv = ctx.get("KV");
	const logger = ctx.get("Logger");

	try {
		const details = await kv.get("repo:details");

		if (!details) {
			const message = "No repo details found in KV store.";

			logger.info(message);

			return ctx.json({ message }, 404);
		}

		logger.success("Repo details fetched successfully.");

		return ctx.json({ data: JSON.parse(details) }, 200);
	} catch (error) {
		const message = "Failed to fetch repo details from KV store.";

		logger.error(message, error);

		return ctx.json({ message }, 500);
	}
}
