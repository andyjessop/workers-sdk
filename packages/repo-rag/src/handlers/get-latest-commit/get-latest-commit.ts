import type { Context } from "../../types";

export async function getLatestCommit({ env }: Context) {
	return await env.WORKERS_SDK_RAG_KV.get("LATEST_COMMIT");
}
