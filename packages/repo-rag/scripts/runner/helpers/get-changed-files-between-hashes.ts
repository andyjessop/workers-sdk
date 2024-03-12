import { execSync } from "child_process";
import path from "path";

export function getChangedFilesBetweenHashes(
	repoPath: string,
	hash1: string | null,
	hash2: string | null
) {
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

			return sourceFiles;
		} catch (error: unknown) {
			throw error;
		}
	} else {
		const validHash1 = hash1 || "HEAD";
		const validHash2 = hash2 || "HEAD";

		const gitCommand = `git diff --name-only ${validHash1} ${validHash2}`;

		const output = execSync(gitCommand, { cwd: repoPath }).toString().trim();

		const changedFiles = output
			.split("\n")
			.map((file) => path.resolve(repoPath, file));

		return changedFiles;
	}
}
