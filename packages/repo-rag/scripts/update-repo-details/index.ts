import { execSync } from "child_process";
import { config } from "dotenv";

config({ path: ".dev.vars" });

const QUERY_URL = "http://localhost:8787/repo_details";

main();

async function main() {
	try {
		// Execute the git command to get the latest SHA
		const latestSHA = execSync("git rev-parse HEAD").toString().trim();

		console.log("Latest SHA:", latestSHA);

		const response = await fetch(QUERY_URL, {
			method: "PUT",
			headers: {
				WORKERS_SDK_RAG_API_KEY: process.env.WORKERS_SDK_RAG_API_KEY as string,
			},
			body: JSON.stringify({
				name: "workers-sdk",
				owner: "andyjessop",
				hash: latestSHA,
			}),
		});

		console.log(((await response.json()) as any).data);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}
