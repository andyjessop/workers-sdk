import { generateText } from "../../ai/generate-text";
import { createContext } from "./create-context";
import { createPrompt } from "./create-prompt";
import type { Context } from "../../types";
import type { StatusCode } from "hono/utils/http-status";

export async function query(ctx: Context) {
	const body = (await ctx.req.json()) as { query: string };

	if (!body?.query) {
		return new Response("Missing query", { status: 400 });
	}

	const { query: q } = body;

	const vectorDb = ctx.get("VectorDb");
	const ai = ctx.get("Ai");
	const embeddings = ctx.get("Embeddings");

	const vector = await embeddings.generateVector(q);

	const { code, data, message, success } = await vectorDb.fetchSimilar(vector);

	if (!success) {
		return ctx.json({ message }, code as StatusCode);
	}

	const context = createContext(data);
	const prompt = createPrompt(context, q);

	const response = await ai.sendMessage(prompt);

	return ctx.json(
		{
			prompt,
			response: response.data,
		},
		200
	);
}
