import {
	compressFilePaths,
	fetchFilePaths,
} from "../../utils/fetch-repo-files";
import { createRepoPrompt } from "./create-repo-prompt";
import type { Context } from "../../types";

export async function updateRepo(ctx: Context) {
	const body = (await ctx.req.json()) as {
		hash: string;
	};
	const owner = ctx.req.param("owner");
	const name = ctx.req.param("name");
	const logger = ctx.get("Logger");
	const repo = ctx.get("Repo");

	const { hash: newHash } = body;

	try {
		// If any part of the repo details have changed, update all the details
		// and fetch the updated file list.
		logger.info(`Fetching repo files for ${repo.getKey()}/${newHash}.`);

		const repoFiles = await fetchFilePaths(
			owner,
			name,
			newHash,
			ctx.env.GITHUB_API_KEY
		);

		let filesPrompt: string | undefined;

		if (repoFiles.success === true) {
			logger.success(`Fetch successful.`);
			logger.info("Compressing files and generating prompt.");

			const compressedFilePaths = compressFilePaths(repoFiles.data);
			filesPrompt = createRepoPrompt(compressedFilePaths);
		} else {
			for (const message of repoFiles.data) {
				logger.error(message);
			}
		}

		// Update the filesPrompt for the specific repo details
		await repo.set({ sha: newHash, filesPrompt });

		const message = `Repo details updated successfully: ${repo.getKey()}/${newHash}`;

		logger.success(message);

		return ctx.json({ message }, 200);
	} catch (error) {
		const message = "Failed to update repo details.";

		logger.error(message, error);

		return ctx.json({ message }, 500);
	}
}
