import type { Context } from "../../types";

export async function deleteRepo(ctx: Context) {
	const kv = ctx.get("KV");
	const logger = ctx.get("Logger");

	try {
		await kv.delete("repo:details");

		const message = "Repo details deleted successfully.";

		logger.success(message);

		return ctx.json({ message }, 200);
	} catch (error) {
		const message = "Failed to delete repo details from KV store.";

		logger.error(message, error);

		return ctx.json({ message }, 500);
	}
}
