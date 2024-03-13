import { input } from "@inquirer/prompts";
import { config } from "dotenv";

config();

const QUERY_URL = "http://localhost:8787/repo_details";

main();

async function main() {
	const hash = await input({ message: "Enter the new sha: " });

	const response = await fetch(QUERY_URL, {
		method: "POST",
		headers: {
			WORKERS_SDK_RAG_API_KEY: process.env.WORKERS_SDK_RAG_API_KEY as string,
		},
		body: JSON.stringify({
			name: "workers-sdk",
			owner: "andyjessop",
			hash,
		}),
	});

	console.log(((await response.json()) as any).data);
}
