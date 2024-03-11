import { EMBEDDINGS_MODEL } from "../constants";
import type { Ai } from "@cloudflare/ai";

export function embeddingGenerator(ai: Ai) {
	return async function generate(content: string) {
		const embedding = await ai.run(EMBEDDINGS_MODEL, {
			text: content,
		});

		const vector = embedding?.data?.[0];

		return vector;
	};
}
