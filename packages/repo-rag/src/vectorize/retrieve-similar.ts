import type { Env } from "../types";

/**
 * Retrieve similar vectors from the index.
 */
export async function retrieveSimilar(vector: number[], env: Env) {
	const similar = await env.WORKERS_SDK_RAG_INDEX.query(vector, {
		topK: 10,
		returnMetadata: true,
	});

	return similar.matches
		.map((match) => ({
			score: match.score,
			content: match.metadata?.content as string,
		}))
		.filter((entry) => entry.content !== undefined);
}
