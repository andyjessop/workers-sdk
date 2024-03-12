import { execSync } from "child_process";
import path from "path";

interface ChangedFiles {
	addedOrModified: string[];
	deleted: string[];
}

export function getChangedFilesBetweenHashes(
	repoPath: string,
	hash1: string | null,
	hash2: string
): ChangedFiles {
	if (hash1 === null) {
		// If the first hash is null, retrieve all the source files in the repository
		const excludedPaths = [
			"node_modules",
			"**/node_modules/**/*",
			"pnpm-lock.yaml",
			".vscode",
			"vendor",
		];

		const gitCommand = `git ls-files -- . ':!${excludedPaths.join("' ':!")}'`;

		try {
			const output = execSync(gitCommand, { cwd: repoPath }).toString().trim();

			const sourceFiles = output
				.split("\n")
				.map((file) => path.resolve(repoPath, file));

			return { addedOrModified: sourceFiles, deleted: [] };
		} catch (error: unknown) {
			throw error;
		}
	} else {
		const validHash1 = hash1 || "HEAD";
		const validHash2 = hash2;

		const gitCommand = `git diff --name-only --diff-filter=ACMR ${validHash1} ${validHash2}`;
		const deletedFilesCommand = `git diff --name-only --diff-filter=D ${validHash1} ${validHash2}`;

		const output = execSync(gitCommand, { cwd: repoPath }).toString().trim();
		const deletedFilesOutput = execSync(deletedFilesCommand, {
			cwd: repoPath,
		})
			.toString()
			.trim();

		const addedOrModifiedFiles = output
			.split("\n")
			.map((file) => path.resolve(repoPath, file));

		const deletedFiles = deletedFilesOutput
			.split("\n")
			.map((file) => path.resolve(repoPath, file));

		return { addedOrModified: addedOrModifiedFiles, deleted: deletedFiles };
	}
}
