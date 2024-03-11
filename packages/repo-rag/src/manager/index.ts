import { findNearestGitFolder } from "./helpers/find-nearest-git-folder";
import { getChangedFilesBetweenHashes } from "./helpers/get-changed-files-between-hashes";
import { getCurrentHash } from "./helpers/get-current-hash";
import { fetchFileContent } from "./helpers/get-file-content";
import { splitFilenamesBySize } from "./helpers/split-filenames-by-size";
import { vectorizeFiles } from "./helpers/vectorize-files";

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();

async function main() {
	const repoPath = findNearestGitFolder();

	if (!repoPath) {
		throw new Error("Cannot find git repo");
	}

	const currentHash = getCurrentHash(repoPath);

	try {
		const response = await fetch("/latest_hash"); // Replace with the actual endpoint URL
		const lastHash = await response.text();

		const changedFiles = getChangedFilesBetweenHashes(
			repoPath,
			lastHash,
			currentHash
		);
		const splitArrays = await splitFilenamesBySize(changedFiles);

		for (const array of splitArrays) {
			const modifiedArray = await Promise.all(
				array.map(async (filename) => {
					const content = await fetchFileContent(filename);

					if (!content) {
						return null;
					}

					return {
						filename,
						content,
					};
				})
			);

			const withoutNullEntries = modifiedArray.filter(
				(entry) => entry !== null
			) as { content: string; filename: string }[];

			await vectorizeFiles(withoutNullEntries);
		}
	} catch (error) {
		console.error("Error:", error);
	}
}
