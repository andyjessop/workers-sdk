import type { Env } from "../types";

export async function deleteIndicesByFilename(filename: string, env: Env) {
	// If there are existing embeddings for this file, delete them
	const existingEntry = (await env.WORKERS_SDK_RAG_KV.get(filename)) ?? "[]";

	const existingIds: string[] = JSON.parse(existingEntry) ?? [];

	if (existingIds.length) {
		await env.WORKERS_SDK_RAG_INDEX.deleteByIds(existingIds);
	}

	return existingIds;
}
