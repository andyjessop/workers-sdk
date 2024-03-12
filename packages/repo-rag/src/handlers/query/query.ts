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

	const { code, data, message, success } = await vectorDb.fetchSimilar(q);

	if (!success) {
		return ctx.json({ message }, code as StatusCode);
	}

	const context = createContext(data);
	const prompt = createPrompt(context, q);

	try {
		const response = await generateText(ai, prompt);

		return ctx.json(
			{
				prompt,
				response: response.response,
			},
			200
		);
	} catch (e) {
		return ctx.json(
			{ message: `Could not create completion: ${e}` },
			{ status: 500 }
		);
	}
}
