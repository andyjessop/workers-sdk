import { execSync } from "child_process";

export function getCurrentHash(gitPath: string) {
	return execSync("git rev-parse HEAD", { cwd: gitPath }).toString().trim();
}
