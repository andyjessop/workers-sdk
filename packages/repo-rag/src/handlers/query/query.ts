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
	const logger = ctx.get("Logger");

	logger.info("Generating vector for prompt.");

	const vector = await embeddings.generateVector(q);

	logger.success("Vector generated successfully.");
	logger.info("Fetching similar vectors.");

	const { code, data, message, success } = await vectorDb.fetchSimilar(
		vector,
		20
	);

	if (!success) {
		logger.error(`Failed fetching similar vectors.`, { code, data, message });

		return ctx.json({ message }, code as StatusCode);
	}

	logger.success(`${data.length} Similar vectors fetched successfully.`);

	const context = createContext(data);
	const prompt = createPrompt(context, q);

	logger.info(`Prompt character length: ${prompt.length}`);
	logger.info("Fetching AI response");

	const response = await ai.sendMessage(prompt);

	if (!response.success) {
		logger.error(`Failed to fetch AI response:`, response.message);

		return ctx.json(
			{
				data: response.data,
			},
			response.code as StatusCode
		);
	}

	logger.success(`AI response fetched successfully.`, response);

	return ctx.json(
		{
			data: response.data,
		},
		200
	);
}
