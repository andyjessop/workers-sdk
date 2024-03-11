import { execSync } from "child_process";
import path from "path";

export function getChangedFilesBetweenHashes(
	repoPath: string,
	hash1: string,
	hash2: string
) {
	const gitCommand = `git diff --name-only ${hash1} ${hash2}`;

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
			const reversedGitCommand = `git diff --name-only ${hash2} ${hash1}`;
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
