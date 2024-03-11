import { Ai } from "@cloudflare/ai";
import { embeddingGenerator } from "../../ai/embedding-generator";
import { textGenerator } from "../../ai/text-generator";
import { retrieveSimilar } from "../../vectorize/retrieve-similar";
import { createContext } from "./create-context";
import { createPrompt } from "./create-prompt";
import type { Context } from "../../types";

export async function query({ req, env, json }: Context) {
	const body = (await req.json()) as { model: string; query: string };

	if (!body?.query) {
		return new Response("Missing query", { status: 400 });
	}

	const { query: q } = body;

	const ai = new Ai(env.WORKERS_SDK_RAG_AI);
	const generateEmbedding = embeddingGenerator(ai);
	const generateText = textGenerator(ai);

	const vector = await generateEmbedding(q);

	if (!vector?.length) {
		return new Response("Could not create embedding", { status: 500 });
	}

	const matches = await retrieveSimilar(vector, env);
	const context = createContext(matches);
	const prompt = createPrompt(context, q);

	try {
		const response = await generateText(prompt);

		return json(
			{
				prompt,
				response,
			},
			200
		);
	} catch (e) {
		return new Response("Could not create completion", { status: 500 });
	}
}
