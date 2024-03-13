import {
	compressFilePaths,
	fetchFilePaths,
} from "../../utils/fetch-repo-files";
import { createRepoPrompt } from "./create-repo-prompt";
import type { Context } from "../../types";

export async function updateRepoDetails(ctx: Context) {
	const body = (await ctx.req.json()) as {
		hash?: string;
		owner?: string;
		name?: string;
	};
	const kv = ctx.get("KV");
	const logger = ctx.get("Logger");

	const { hash: newHash, owner: newOwner, name: newName } = body;

	try {
		const details = await kv.get("repo:details");

		const parsedDetails = details ? JSON.parse(details) : {};

		const newDetails = {
			...parsedDetails,
			hash: newHash,
			owner: newOwner,
			name: newName,
		};

		// If any part of the repo details have changed, update all the details
		// and fetch the updated file list.
		if (newHash || newOwner || newName) {
			const newDetailsString = JSON.stringify(newDetails);
			await kv.put("repo:details", newDetailsString);

			const repoFiles = await fetchFilePaths(
				newDetails.owner,
				newDetails.name,
				newDetails.hash,
				ctx.env.GITHUB_API_KEY
			);

			if (repoFiles.success === true) {
				const compressedFilePaths = compressFilePaths(repoFiles.data);
				const repoPrompt = createRepoPrompt(compressedFilePaths);
				await kv.put("repo:prompt", repoPrompt);
			} else {
				for (const message of repoFiles.data) {
					logger.error(message);
				}
			}

			const message = `Repo details updated successfully: ${newDetails.owner}/${newDetails.name}/${newDetails.hash}`;

			logger.success(message);

			return ctx.json({ message }, 200);
		} else {
			const message = "Nothing to update.";

			logger.success(message);

			return ctx.json({ message }, 200);
		}
	} catch (error) {
		const message = "Failed to update repo details.";

		logger.error(message, error);

		return ctx.json({ message }, 500);
	}
}
