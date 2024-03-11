import { TEXT_GENERATION_MODEL } from "../constants";
import type { Ai } from "@cloudflare/ai";

export function textGenerator(ai: Ai) {
	return async function generate(prompt: string) {
		const chatCompletion = await ai.run(TEXT_GENERATION_MODEL, {
			messages: [{ role: "user", content: prompt }],
		});

		return chatCompletion.answer;
	};
}
