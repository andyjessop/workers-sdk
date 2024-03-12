import { input } from "@inquirer/prompts";
import { config } from "dotenv";

config();

const QUERY_URL = "http://localhost:8787/vectors/query";

main();

async function main() {
	const prompt = await input({ message: "Enter your prompt" });

	const response = await fetch(QUERY_URL, {
		method: "POST",
		headers: {
			WORKERS_SDK_RAG_API_KEY: process.env.WORKERS_SDK_RAG_API_KEY as string,
		},
		body: JSON.stringify({
			query: prompt,
		}),
	});

	console.log(((await response.json()) as any).response);
}
