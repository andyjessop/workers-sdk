import { execSync } from "child_process";
import path from "path";

export function getChangedFilesBetweenHashes(
	repoPath: string,
	hash1: string | null,
	hash2: string | null
) {
	const validHash1 = hash1 || "HEAD";
	const validHash2 = hash2 || "HEAD";

	const gitCommand = `git diff --name-only ${validHash1} ${validHash2}`;

	try {
		const output = execSync(gitCommand, { cwd: repoPath }).toString().trim();

		const changedFiles = output
			.split("\n")
			.map((file) => path.resolve(repoPath, file));

		return changedFiles;
	} catch (error: unknown) {
		if (
			(error as { stderr: Error }).stderr
				.toString()
				.includes("unknown revision or path not in the working tree")
		) {
			// One or both hashes are not valid, try reversing the order
			const reversedGitCommand = `git diff --name-only ${validHash2} ${validHash1}`;

			const output = execSync(reversedGitCommand, { cwd: repoPath })
				.toString()
				.trim();

			const changedFiles = output
				.split("\n")
				.map((file) => path.resolve(repoPath, file));

			return changedFiles;
		} else {
			throw error;
		}
	}
}
