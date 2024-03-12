import { config } from "dotenv";
import { findRepoRoot } from "./helpers/find-repo-root";
import { getChangedFilesBetweenHashes } from "./helpers/get-changed-files-between-hashes";
import { getCurrentHash } from "./helpers/get-current-hash";
import { fetchFileContent } from "./helpers/get-file-content";
import { splitFilenamesBySize } from "./helpers/split-filenames-by-size";

config();

const CURRENT_HASH_URL =
	"https://workers-sdk-rag.andrewdjessop.workers.dev/current_hash";

const CREATE_VECTORS_URL =
	"https://workers-sdk-rag.andrewdjessop.workers.dev/vectors";

const DELETE_BY_FILENAME_URL =
	"https://workers-sdk-rag.andrewdjessop.workers.dev/vectors/delete_by_filename";

const isDryRun = process.argv.includes("--dry-run");

const excludedfiles = ["pnpm-lock.yaml"];

main();

async function main() {
	const repoPath = findRepoRoot();

	if (!repoPath) {
		throw new Error("Cannot find git repo");
	}

	const currentHash = getCurrentHash(repoPath);

	try {
		const currentHashResponse = await fetch(CURRENT_HASH_URL, {
			headers: {
				WORKERS_SDK_RAG_API_KEY: process.env.WORKERS_SDK_RAG_API_KEY as string,
			},
		});

		const lastHash = (await currentHashResponse.json()) as {
			data: string | null;
		};

		const { addedOrModified, deleted } = getChangedFilesBetweenHashes(
			repoPath,
			lastHash.data,
			currentHash
		);

		console.log(addedOrModified);

		await fetch(DELETE_BY_FILENAME_URL, {
			method: "POST",
			headers: {
				WORKERS_SDK_RAG_API_KEY: process.env.WORKERS_SDK_RAG_API_KEY as string,
			},
			body: JSON.stringify({ filenames: deleted }),
		});

		const { totalSize, splitArrays } = await splitFilenamesBySize(
			addedOrModified
		);

		console.log(`Total file size: ${totalSize} bytes`);

		for (const array of splitArrays) {
			const modifiedArray = await Promise.all(
				array.map(async ({ filename }) => {
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

			const vectorizeUrl = isDryRun
				? `${CREATE_VECTORS_URL}?dry-run`
				: CREATE_VECTORS_URL;

			// const vectorizeResponse = await vectorizeFiles(
			// 	withoutNullEntries,
			// 	vectorizeUrl
			// );

			console.log(vectorizeUrl, withoutNullEntries.length);
		}
	} catch (error) {
		console.error("Error:", error);
	}
}
