import fs from "fs";
import path from "path";

export function findNearestGitFolder(
	currentDir = process.cwd()
): string | null {
	const gitFolder = path.join(currentDir, ".git");

	if (fs.existsSync(gitFolder) && fs.statSync(gitFolder).isDirectory()) {
		return currentDir;
	}

	const parentDir = path.dirname(currentDir);

	if (parentDir === currentDir) {
		return null; // Reached the root directory without finding a .git folder
	}

	return findNearestGitFolder(parentDir);
}
